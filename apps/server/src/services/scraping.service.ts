import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';
import pLimit from 'p-limit';

interface ScrapedItem {
  [key: string]: string;
}

interface BatchConfig {
  batchSize: number;
  rateLimit: number;
}

interface ScrapingResult {
  url: string;
  success: boolean;
  results: ScrapedItem[];
  error?: string;
}

export class ScrapingService {
  private limiter: RateLimiter;

  constructor() {
    // Default rate limit: 100 requests per 15 minutes
    this.limiter = new RateLimiter({
      tokensPerInterval: 100,
      interval: 15 * 60 * 1000 // 15 minutes in milliseconds
    });
  }

  async scrapeUrls(
    urls: string[],
    selector: string,
    selectorType: 'css' | 'xpath',
    attributes: string[] = ['text'],
    batchConfig?: BatchConfig
  ): Promise<ScrapingResult[]> {
    const config = {
      batchSize: batchConfig?.batchSize || 5,
      rateLimit: batchConfig?.rateLimit || 10
    };

    // Create a rate limiter for this batch
    const batchLimiter = new RateLimiter({
      tokensPerInterval: config.rateLimit,
      interval: 60 * 1000 // 1 minute
    });

    // Create a concurrency limiter
    const concurrencyLimit = pLimit(config.batchSize);

    // Process URLs in batches with rate limiting
    const results = await Promise.all(
      urls.map(url =>
        concurrencyLimit(async () => {
          try {
            // Check both limiters
            const [globalTokens, batchTokens] = await Promise.all([
              this.limiter.tryRemoveTokens(1),
              batchLimiter.tryRemoveTokens(1)
            ]);

            if (!globalTokens || !batchTokens) {
              throw new Error('Rate limit exceeded');
            }

            const scrapedData = await this.scrapeUrl(url, selector, selectorType, attributes);
            return {
              url,
              success: true,
              results: scrapedData
            };
          } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            return {
              url,
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
    attributes: string[] = ['text']
  ): Promise<ScrapedItem[]> {
    console.log('Scraping URL:', url);
    console.log('Using selector:', selector);
    console.log('Selector type:', selectorType);
    console.log('Extracting attributes:', attributes);

    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);

      // Remove noscript tags as they can contain duplicate content
      $('noscript').remove();

      let elements;
      if (selectorType === 'xpath') {
        // TODO: Implement XPath support
        throw new Error('XPath selectors not yet supported');
      } else {
        elements = $(selector);
      }

      console.log(`Found ${elements.length} elements matching selector: ${selector}`);

      const results: ScrapedItem[] = [];
      elements.each((_, el) => {
        const item: ScrapedItem = {};
        
        attributes.forEach(attr => {
          if (attr === 'text') {
            item[attr] = $(el).text().trim();
          } else if (attr === 'html') {
            item[attr] = $(el).html() || '';
          } else {
            const value = $(el).attr(attr);
            if (value) {
              item[attr] = value;
            }
          }
        });

        if (Object.keys(item).length > 0) {
          results.push(item);
        }
      });

      return results;
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw error;
    }
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  formatResults(results: ScrapedItem[], template: string): string[] {
    return results.map(item => {
      let formatted = template;
      Object.entries(item).forEach(([key, value]) => {
        formatted = formatted.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      return formatted;
    });
  }

  formatBatchResults(results: ScrapingResult[], template?: string): string[] {
    if (!template) {
      // If no template, return JSON stringified results
      return results.map(result => 
        JSON.stringify({
          url: result.url,
          success: result.success,
          data: result.results
        })
      );
    }

    return results.flatMap(result => {
      if (!result.success) {
        return [`Error scraping ${result.url}: ${result.error}`];
      }
      return this.formatResults(result.results, template);
    });
  }
} 
