import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';

interface ScrapedItem {
  [key: string]: string;
}

export class ScrapingService {
  private limiter: RateLimiter;

  constructor() {
    // Rate limit: 100 requests per 15 minutes
    this.limiter = new RateLimiter({
      tokensPerInterval: 100,
      interval: 15 * 60 * 1000 // 15 minutes in milliseconds
    });
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

    // Wait for rate limiter
    await this.limiter.removeTokens(1);

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
        formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      return formatted;
    });
  }
} 
