import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';
import pLimit from 'p-limit';
import xpath from 'xpath';
import { DOMParser } from 'xmldom';
import memoize from 'lodash/memoize';
import type { Browser, Page, HTTPRequest, ConsoleMessage } from 'puppeteer';
import puppeteer from 'puppeteer';
import { 
  SelectorConfig, 
  ScrapedItem, 
  BatchConfig, 
  ScrapingResult 
} from '../types/scraping';
import { SelectorConfigInput } from "../schema/scraping";

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
      console.log('Using Puppeteer for JavaScript rendering');
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      try {
        // Set a reasonable viewport
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Set longer timeouts
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);

        // Enable request interception for blocking unnecessary requests
        await page.setRequestInterception(true);
        page.on('request', (request: HTTPRequest) => {
          const url = request.url();
          // Only allow HTML documents and essential scripts
          if (
            request.resourceType() === 'document' ||
            (request.resourceType() === 'script' && url.includes('discourse')) ||
            request.resourceType() === 'xhr'
          ) {
            console.log('Allowing request:', request.resourceType(), url);
            request.continue();
          } else {
            console.log('Blocking request:', request.resourceType(), url);
            request.abort();
          }
        });

        // Log console messages
        page.on('console', (msg: ConsoleMessage) => {
          if (msg.type() === 'error') {
            console.log('Browser console error:', msg.text());
          }
        });
        
        // Navigate and wait for network idle
        console.log('Navigating to page:', url);
        await page.goto(url, { 
          waitUntil: ['domcontentloaded', 'networkidle2'],
          timeout: 30000 
        });
        
        console.log('Page loaded, waiting for content');
        
        // Wait for the main content to load
        try {
          await page.waitForFunction(() => {
            const topicList = document.querySelector('.topic-list');
            const latestTopicList = document.querySelector('.latest-topic-list');
            return topicList || latestTopicList;
          }, { timeout: 10000 });
          console.log('Found topic list element');
        } catch (error) {
          console.log('Timeout waiting for topic list, proceeding anyway');
        }

        // Get the final HTML
        data = await page.content();
        
        // Log some stats about the content
        console.log('Final HTML length:', data.length);
        
        // Check for specific elements
        const elementCounts = await page.evaluate(() => ({
          topicList: document.querySelectorAll('.topic-list').length,
          topicListItems: document.querySelectorAll('.topic-list-item').length,
          mainLinks: document.querySelectorAll('.main-link').length,
          allLinks: document.querySelectorAll('a').length,
          // Log some sample elements to help with selector debugging
          sampleElements: Array.from(document.querySelectorAll('a')).slice(0, 5).map(a => ({
            text: a.textContent?.trim(),
            href: a.getAttribute('href'),
            class: a.getAttribute('class'),
            parentClass: a.parentElement?.getAttribute('class')
          }))
        }));
        console.log('Element counts:', elementCounts);
        console.log('Sample elements:', elementCounts.sampleElements);
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
    console.log('Scraping multiple URLs:', urls);
    console.log('Using selector:', selector);
    console.log('Batch config:', batchConfig);

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

            // Fetch the page
            console.log('Fetching page:', url);
            const html = await this.getCachedPage(url);
            console.log('Page fetched, length:', html.length);
            const $ = cheerio.load(html);

            // Remove noscript tags as they can contain duplicate content
            $('noscript').remove();

            // Debug: Log a sample of the HTML
            console.log('HTML sample:', html.substring(0, 1000));
            console.log('Body HTML sample:', $('body').html()?.substring(0, 1000));

            const data: { [key: string]: string } = {};
            
            // Process the selector using the same Cheerio instance
            console.log(`Processing selector "${selector.selector}" for "${selector.name}"`);
            let elements;
            if (selector.selectorType === 'xpath') {
              // TODO: Implement XPath support
              throw new Error('XPath selectors not yet supported');
            } else {
              elements = $(selector.selector);
            }

            console.log(`Found ${elements.length} elements matching selector: ${selector.selector}`);
            if (elements.length === 0) {
              console.log(`No elements found for selector "${selector.selector}"`);
              console.log('Available elements with similar classes:', 
                $('[itemprop]').length ? $('[itemprop]').get().map(el => $(el).attr('itemprop')).join(', ') : 'None');
              throw new Error(`No elements found for selector "${selector.selector}"`);
            }

            // Take only the first element's data
            const firstElement = elements.first();
            selector.attributes.forEach(attr => {
              if (attr === 'text') {
                const text = firstElement.text().trim();
                console.log(`Extracted text for ${selector.name}:`, text);
                data[selector.name] = text;
              } else if (attr === 'html') {
                const html = firstElement.html() || '';
                console.log(`Extracted HTML for ${selector.name}:`, html);
                data[selector.name] = html;
              } else {
                const value = firstElement.attr(attr);
                console.log(`Extracted ${attr} for ${selector.name}:`, value);
                if (value) {
                  data[selector.name] = value;
                }
              }
            });

            console.log('Final data object:', data);

            return {
              success: true,
              data,
              results: [JSON.stringify(data)]
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
    console.log('Scraping URL:', url);
    console.log('Using selector:', selector);
    console.log('Selector type:', selectorType);
    console.log('Extracting attributes:', attributes);

    try {
      // Use JavaScript rendering for Discourse forums
      const isDiscourseForum = url.includes('forum.cursor.com');
      const html = await this.getCachedPage(url, isDiscourseForum);

      const results: ScrapedItem[] = [];

      if (selectorType === 'xpath') {
        // XPath processing
        const doc = new DOMParser({
          errorHandler: {
            warning: () => {},
            error: () => {},
            fatalError: () => {}
          }
        }).parseFromString(html);

        const nodes = xpath.select(selector, doc);
        console.log('XPath nodes found:', nodes.length);

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
        console.log(`Found ${elements.length} elements matching selector:`, selector);

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

        // Log a sample of the results
        if (results.length > 0) {
          console.log('Sample of results:', results.slice(0, 3));
        }
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
      console.log('Testing scraping with:', { url, selectors });
      
      // Get the page content
      const html = await this.getCachedPage(url, true);
      const $ = cheerio.load(html);
      
      // Process each selector
      const results: string[][] = [];
      
      for (const selector of selectors) {
        console.log(`Processing selector: ${selector.name}`, selector);
        
        let elements;
        if (selector.selectorType === 'xpath') {
          const doc = new DOMParser().parseFromString(html);
          elements = xpath.select(selector.selector, doc);
        } else {
          elements = $(selector.selector);
        }
        
        console.log(`Found ${elements.length} elements`);
        
        // Extract data from each element
        elements.each((_, element) => {
          const $el = $(element);
          const row: string[] = [];
          
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
