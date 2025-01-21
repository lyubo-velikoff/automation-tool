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
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: string[] = [];

      if (selectorType === 'css') {
        const elements = $(selector);
        if (elements.length > 0) {
          elements.each((_, element) => {
            const $element = $(element);
            if (attribute === 'text' || !attribute) {
              const text = $element.text().trim();
              if (text) results.push(text);
            } else if (attribute === 'html') {
              const html = $element.html();
              if (html) results.push(html.trim());
            } else {
              const attrValue = $element.attr(attribute);
              if (attrValue !== undefined) {
                results.push(attrValue);
              }
            }
          });
        }
      } else if (selectorType === 'xpath') {
        // XPath support can be added here if needed
        throw new Error('XPath support not implemented yet');
      }

      return results.map(result => {
        // If the result is HTML-like, extract only text
        if (result.includes('<') && result.includes('>')) {
          const $temp = cheerio.load(result);
          return $temp.text().trim();
        }
        return result.trim();
      }).filter(Boolean);

    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }
} 
