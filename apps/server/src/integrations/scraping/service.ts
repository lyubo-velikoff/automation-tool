import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';

export class ScrapingService {
  private limiter: RateLimiter;

  constructor() {
    // Rate limit to 10 requests per minute
    this.limiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 'minute'
    });
  }

  async scrapeUrl(
    url: string,
    selector: string,
    selectorType: 'css' | 'xpath',
    attribute: string
  ): Promise<string[]> {
    // Wait for rate limiter
    await this.limiter.removeTokens(1);

    try {
      console.log(`Fetching URL: ${url} with selector: ${selector}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Debug logging
      console.log(`Looking for elements with selector: ${selector}`);
      const elements = $(selector);
      console.log(`Found ${elements.length} elements matching selector`);
      
      const results: string[] = [];
      
      elements.each((index, element) => {
        const $element = $(element);
        const text = $element.text().trim();
        console.log(`Element ${index} text:`, text);
        if (text) {
          results.push(text);
          console.log('Added to results:', text);
        }
      });

      console.log('Final results:', results);
      return results;

    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }
} 
