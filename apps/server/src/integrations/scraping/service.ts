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
  private readonly defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

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
    await this.limiter.removeTokens(1);

    try {
      console.log(`Fetching URL: ${url}`);
      const html = await this.fetchPage(url);
      console.log(`HTML length: ${html.length} characters`);
      
      const $ = cheerio.load(html);
      const results: ScrapedItem[] = [];

      // Handle Cursor forum special case
      if (url.includes('forum.cursor.com') && selector.includes('forum-posts')) {
        console.log('Using Cursor forum special handler');
        return this.handleCursorForumPosts($);
      }

      // Use provided selector
      console.log(`Using selector: ${selector} (${selectorType})`);
      const elements = $(selector);
      console.log(`Found ${elements.length} elements matching selector: ${selector}`);

      if (elements.length === 0) {
        // Log a sample of the HTML to help debug selector issues
        console.log('Sample HTML:', html.slice(0, 500));
      }

      elements.each((_, element) => {
        const $element = $(element);
        const item: ScrapedItem = { text: '' };

        // Extract requested attributes
        attributes.forEach(attr => {
          if (attr === 'text') {
            item.text = $element.text().trim();
          } else if (attr === 'html') {
            item.html = $element.html()?.trim() || '';
          } else if (attr === 'innerText') {
            // Get text content without HTML tags
            item.innerText = $element.contents().text().trim();
          } else {
            const value = $element.attr(attr);
            if (value) {
              if (attr === 'href' || attr === 'src') {
                item[attr] = this.resolveUrl(url, value);
              } else {
                item[attr] = value;
              }
            }
          }
        });

        console.log('Extracted item:', item);

        if (Object.values(item).some(v => v)) {
          results.push(item);
        }
      });

      console.log(`Returning ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Scraping error:', error);
      throw this.handleError(error);
    }
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.defaultUserAgent
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL (${response.status}): ${response.statusText}`);
    }

    return response.text();
  }

  private handleCursorForumPosts($: cheerio.CheerioAPI): ScrapedItem[] {
    const results: ScrapedItem[] = [];
    
    // Find all topic links in the forum
    $('td a[href*="/t/"]').each((_, element) => {
      const $element = $(element);
      const href = $element.attr('href');
      const text = $element.text().trim();
      
      if (href?.includes('/t/')) {
        // Extract topic ID and slug
        const topicMatch = href.match(/\/t\/([^\/]+)\/(\d+)/);
        if (topicMatch) {
          const [, slug, id] = topicMatch;
          results.push({
            text,
            href: `https://forum.cursor.com${href}`,
            topicId: id,
            slug,
            title: text
          });
        }
      }
    });

    return results;
  }

  private resolveUrl(baseUrl: string, relativeUrl: string): string {
    try {
      if (relativeUrl.startsWith('http')) {
        return relativeUrl;
      }
      const base = new URL(baseUrl);
      if (relativeUrl.startsWith('//')) {
        return `${base.protocol}${relativeUrl}`;
      }
      if (relativeUrl.startsWith('/')) {
        return `${base.origin}${relativeUrl}`;
      }
      return new URL(relativeUrl, baseUrl).toString();
    } catch {
      return relativeUrl;
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred during scraping');
  }

  formatResults(results: ScrapedItem[], template: string = '[{text}]({href})'): string[] {
    return results.map(item => {
      let formatted = template;
      Object.entries(item).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        formatted = formatted.replace(regex, value?.toString() || '');
      });
      return formatted;
    });
  }
} 
