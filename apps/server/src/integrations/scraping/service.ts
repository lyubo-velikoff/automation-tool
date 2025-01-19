import axios from 'axios';
import * as cheerio from 'cheerio';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter: 100 requests per IP per 15 minutes
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 15 * 60,
});

export class ScrapingService {
  private async checkRateLimit(userId: string) {
    try {
      await rateLimiter.consume(userId);
    } catch (error) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  async scrapeUrl(url: string, selector: string, selectorType: 'css' | 'xpath', attribute?: string, userId?: string) {
    if (userId) {
      await this.checkRateLimit(userId);
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      let elements;

      if (selectorType === 'css') {
        elements = $(selector);
      } else {
        // XPath not directly supported by cheerio, fallback to CSS
        elements = $(selector);
      }

      const results: string[] = [];
      elements.each((_, element) => {
        if (attribute) {
          const attrValue = $(element).attr(attribute);
          if (attrValue) results.push(attrValue);
        } else {
          results.push($(element).text().trim());
        }
      });

      return results;
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
