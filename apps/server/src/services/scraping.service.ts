import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';
import pLimit from 'p-limit';
import xpath from 'xpath';
import { DOMParser } from 'xmldom';
import type { Browser, Page, HTTPRequest, ConsoleMessage } from 'puppeteer';
import puppeteer from 'puppeteer';
import { 
  SelectorConfig, 
  ScrapedItem, 
  BatchConfig, 
  ScrapingResult 
} from '../types/scraping';
import { SelectorConfigInput } from "../schema/scraping";

// Define a proper error handler
const xmlErrorHandler = {
  warning: (msg: string) => {},
  error: (msg: string) => {},
  fatalError: (msg: string) => {}
};

export class ScrapingService {
  private limiter: RateLimiter;
  private fetchPageCache: Map<string, { data: string; timestamp: number }> = new Map();
  private browser: Browser | null = null;

  constructor() {
    // Global rate limiter: 1 request per second
    this.limiter = new RateLimiter({ tokensPerInterval: 1, interval: 'second' });
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });
    }
    return this.browser;
  }

  private async getCachedPage(url: string, useJavaScript: boolean = false): Promise<string> {
    const now = Date.now();
    const cached = this.fetchPageCache.get(url);

    if (cached && now - cached.timestamp < 5000) {
      return cached.data;
    }

    let data: string;
    if (useJavaScript) {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      try {
        await page.setViewport({ width: 1920, height: 1080 });
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);

        // Enable request interception for blocking unnecessary requests
        await page.setRequestInterception(true);
        page.on('request', (request: HTTPRequest) => {
          const url = request.url();
          if (
            request.resourceType() === 'document' ||
            (request.resourceType() === 'script' && url.includes('discourse')) ||
            request.resourceType() === 'xhr'
          ) {
            request.continue();
          } else {
            request.abort();
          }
        });

        // Only log critical browser errors
        page.on('console', (msg: ConsoleMessage) => {
          if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
            console.error('Browser error:', msg.text());
          }
        });
        
        await page.goto(url, { 
          waitUntil: ['domcontentloaded', 'networkidle2'],
          timeout: 30000 
        });
        
        // Wait for the main content to load
        try {
          await page.waitForFunction(() => {
            const topicList = document.querySelector('.topic-list');
            const latestTopicList = document.querySelector('.latest-topic-list');
            return topicList || latestTopicList;
          }, { timeout: 10000 });
        } catch (error) {
          console.error('Proceeding without waiting for topic list');
        }

        data = await page.content();
        
        // Log only essential element counts
        const elementCounts = await page.evaluate(() => ({
          topicList: document.querySelectorAll('.topic-list').length,
          topicListItems: document.querySelectorAll('.topic-list-item').length,
          mainLinks: document.querySelectorAll('.main-link').length
        }));
      } finally {
        await page.close();
      }
    } else {
      const response = await this.fetchPage(url);
      data = response;
    }

    this.fetchPageCache.set(url, { data, timestamp: now });
    return data;
  }

  async scrapeUrls(
    urls: string[],
    selector: SelectorConfig,
    selectorType: 'css' | 'xpath',
    attributes: string[],
    batchConfig?: BatchConfig
  ): Promise<ScrapingResult[]> {

    // Default batch configuration
    const batchSize = batchConfig?.batchSize || 1;
    const rateLimit = batchConfig?.rateLimit || 1;

    // Create a batch-specific rate limiter
    const batchLimiter = new RateLimiter({ tokensPerInterval: rateLimit, interval: 'second' });
    
    const concurrencyLimit = pLimit(batchSize);

    const results = await Promise.all(
      urls.map(url =>
        concurrencyLimit(async () => {
          try {
            // Wait for rate limiters sequentially to avoid race conditions
            await this.limiter.removeTokens(1);
            await batchLimiter.removeTokens(1);

            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));

            const html = await this.getCachedPage(url);
            const $ = cheerio.load(html);

            // Remove noscript tags as they can contain duplicate content
            $('noscript').remove();

            const extractedData: Record<string, string>[] = [];
            
            // Process the selector using the same Cheerio instance
            let elements;
            if (selector.selectorType === 'xpath') {
              // TODO: Implement XPath support
              throw new Error('XPath selectors not yet supported');
            } else {
              elements = $(selector.selector);
            }

            if (elements.length === 0) {
              return {
                success: false,
                results: [],
                error: `No elements found for selector "${selector.selector}"`
              };
            }

            // Process all matching elements
            elements.each((_, element) => {
              const $el = $(element);
              const elementData: Record<string, string> = {};

              selector.attributes.forEach(attr => {
                if (attr === 'text') {
                  elementData[selector.name] = $el.text().trim();
                } else if (attr === 'html') {
                  elementData[selector.name] = $el.html()?.trim() || '';
                } else {
                  const value = $el.attr(attr);
                  if (value) {
                    elementData[selector.name] = value.trim();
                  }
                }
              });

              if (Object.keys(elementData).length > 0) {
                extractedData.push(elementData);
              }
            });

            return {
              success: true,
              results: extractedData
            };
          } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            return {
              success: false,
              results: [],
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
          }
        })
      )
    );

    return results;
  }

  async scrapeUrl(
    url: string,
    selector: string,
    selectorType: 'css' | 'xpath',
    attributes: string[] = ['text'],
    selectorName: string = 'text'
  ): Promise<ScrapedItem[]> {

    try {
      // Use JavaScript rendering for Discourse forums
      const isDiscourseForum = url.includes('forum.cursor.com');
      const html = await this.getCachedPage(url, isDiscourseForum);

      const results: ScrapedItem[] = [];

      if (selectorType === 'xpath') {
        // XPath processing
        const parser = new DOMParser({ errorHandler: xmlErrorHandler });
        const doc = parser.parseFromString(html, 'text/html');
        const nodes = xpath.select(selector, doc as unknown as Node);

        if (!Array.isArray(nodes)) {
          throw new Error('Invalid XPath selector');
        }

        for (const node of nodes) {
          const item: ScrapedItem = {};
          
          for (const attr of attributes) {
            if (attr === 'text') {
              const text = xpath.select('string(.)', node).toString().trim();
              if (text) item[selectorName] = text;
            } else if (attr === 'html') {
              // Not supported for XPath
              console.warn('HTML attribute not supported for XPath selectors');
            } else {
              const value = xpath.select(`string(@${attr})`, node).toString();
              if (value) item[selectorName] = value;
            }
          }

          if (Object.keys(item).length > 0) {
            results.push(item);
          }
        }
      } else {
        // CSS processing with Cheerio
        const $ = cheerio.load(html);
        $('noscript').remove();

        const elements = $(selector);

        elements.each((_, el) => {
          const item: ScrapedItem = {};
          const $el = $(el);
          
          attributes.forEach(attr => {
            if (attr === 'text') {
              const text = $el.text().trim();
              if (text) item[selectorName] = text;
            } else if (attr === 'html') {
              const html = $el.html() || '';
              if (html) item[selectorName] = html;
            } else {
              const value = $el.attr(attr);
              if (value) item[selectorName] = value;
            }
          });

          if (Object.keys(item).length > 0) {
            results.push(item);
          }
        });
      }

      return results;
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw error;
    }
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }
    return response.text();
  }

  formatResults(results: ScrapedItem[], template: string): string[] {
    return results.map(result => {
      let formatted = template;
      Object.entries(result).forEach(([key, value]) => {
        formatted = formatted.replace(`{${key}}`, value || '');
      });
      return formatted;
    });
  }

  formatBatchResults(results: ScrapingResult[], template: string): string[] {
    return results
      .filter(r => r.success && r.data)
      .map(result => {
        let formatted = template;
        if (result.data) {
          Object.entries(result.data).forEach(([key, value]) => {
            formatted = formatted.replace(`{${key}}`, value || '');
          });
        }
        return formatted;
      });
  }

  async testScraping(url: string, selectors: SelectorConfigInput[]): Promise<ScrapingResult> {
    try {
      
      const html = await this.getCachedPage(url, true);
      const $ = cheerio.load(html);
      
      const results: string[][] = [];
      
      for (const selector of selectors) {
        if (selector.selectorType === 'xpath') {
          const parser = new DOMParser({ errorHandler: xmlErrorHandler });
          const doc = parser.parseFromString(html, 'text/html');
          const nodes = xpath.select(selector.selector, doc as unknown as Node);

          if (!Array.isArray(nodes)) {
            throw new Error('Invalid XPath selector result');
          }
                    
          for (const node of nodes) {
            const row: string[] = [];
            
            for (const attr of selector.attributes) {
              let value = '';
              if (attr === 'text') {
                value = xpath.select('string(.)', node).toString().trim();
              } else if (attr === 'html') {
                value = ''; // HTML not supported for XPath
              } else {
                value = xpath.select(`string(@${attr})`, node).toString().trim();
              }
              row.push(value);
            }
            
            if (row.some(v => v)) {
              results.push(row);
            }
          }
        } else {
          const elements = $(selector.selector);
          
          elements.each((_, element) => {
            const row: string[] = [];
            const $el = $(element);
            
            for (const attr of selector.attributes) {
              let value = '';
              if (attr === 'text') {
                value = $el.text().trim();
              } else if (attr === 'html') {
                value = $el.html()?.trim() || '';
              } else {
                value = $el.attr(attr)?.trim() || '';
              }
              row.push(value);
            }
            
            if (row.some(v => v)) {
              results.push(row);
            }
          });
        }
      }
      
      return {
        success: true,
        results,
        error: null
      };
    } catch (error) {
      console.error('Error in testScraping:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 
