import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';

interface ScrapedItem {
  text: string;
  href?: string;
  [key: string]: any;
}

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
    attributes: string[] = ['text']
  ): Promise<ScrapedItem[]> {
    // Wait for rate limiter
    await this.limiter.removeTokens(1);

    try {
      console.log(`Fetching URL: ${url} with selector: ${selector}`);
      
      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('Fetched HTML content (first 500 chars):', html.substring(0, 500));
      console.log('Full HTML length:', html.length);
      
      const $ = cheerio.load(html);
      const results: ScrapedItem[] = [];

      // Log all td elements to see what's available
      console.log('Found td elements:', $('td').length);
      $('td').each((i, el) => {
        console.log(`TD ${i}:`, $(el).html()?.substring(0, 100));
      });

      // Special handling for Cursor forum if no specific selector is provided
      if (url.includes('forum.cursor.com') && !selector) {
        console.log('Using default Cursor forum selectors');
        $('td a').each((_, element) => {
          const $element = $(element);
          const href = $element.attr('href');
          const text = $element.text().trim();
          
          if (href && href.includes('/t/')) {
            results.push({
              text,
              href: `https://forum.cursor.com${href}`
            });
          }
        });
      } else {
        // Use provided selector
        console.log(`Looking for elements with selector: ${selector}`);
        const elements = $(selector);
        console.log(`Found ${elements.length} elements matching selector`);
        
        elements.each((_, element) => {
          const $element = $(element);
          const item: ScrapedItem = { text: '' };

          // Extract requested attributes
          attributes.forEach(attr => {
            if (attr === 'text') {
              item.text = $element.text().trim();
            } else {
              const value = $element.attr(attr);
              if (value) {
                // Handle relative URLs for href attributes
                if (attr === 'href' && value.startsWith('/')) {
                  const baseUrl = new URL(url).origin;
                  item[attr] = `${baseUrl}${value}`;
                } else {
                  item[attr] = value;
                }
              }
            }
          });

          // Only add items that have at least one non-empty value
          if (Object.values(item).some(v => v)) {
            console.log('Found item:', item);
            results.push(item);
          }
        });
      }

      console.log('Final results:', results);
      return results;

    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  }

  formatResults(results: ScrapedItem[], template: string = '[{text}]({href})'): string[] {
    return results.map(item => {
      let formatted = template;
      Object.entries(item).forEach(([key, value]) => {
        formatted = formatted.replace(`{${key}}`, value || '');
      });
      return formatted;
    });
  }
} 
