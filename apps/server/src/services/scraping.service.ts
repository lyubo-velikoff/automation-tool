import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';
import { load } from 'cheerio';
import { Headers } from 'node-fetch';

interface ScrapedItem {
  text: string;
  href?: string;
  [key: string]: any;
}

export class ScrapingService {
  private limiter: RateLimiter;
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  private rateLimitTokens: { [key: string]: number } = {};

  constructor() {
    // Rate limit to 10 requests per minute
    this.limiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 'minute'
    });
  }

  private getAbsoluteUrl(baseUrl: string, path: string): string {
    try {
      if (path.startsWith('http')) {
        return path;
      }
      const base = new URL(baseUrl);
      if (path.startsWith('//')) {
        return `${base.protocol}${path}`;
      }
      if (path.startsWith('/')) {
        return `${base.origin}${path}`;
      }
      return new URL(path, base).toString();
    } catch (error) {
      console.error('Error creating absolute URL:', error);
      return path;
    }
  }

  async scrapeWithSelector(url: string, selector: string): Promise<ScrapedItem[]> {
    return this.scrapeUrl(url, selector, 'css', ['text', 'href']);
  }

  async scrapeUrl(
    url: string,
    selector: string,
    selectorType: 'css' | 'xpath' = 'css',
    attributes: string[] = ['text']
  ): Promise<ScrapedItem[]> {
    console.log('Starting scrapeUrl with:', { url, selector, selectorType, attributes });
    
    // Remove rate limit token if exists
    if (this.rateLimitTokens[url]) {
      console.log('Rate limit token removed');
      delete this.rateLimitTokens[url];
    }

    try {
      // Fetch the URL
      console.log('Fetching URL...');
      const headers = new Headers({
        'User-Agent': this.USER_AGENT
      });
      console.log('Fetching URL with headers:', headers);
      
      const response = await fetch(url, { headers });
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', response.headers);
      
      const html = await response.text();
      console.log('Response text length:', html.length);
      console.log('Fetched HTML (' + html.length + ' characters)');
      console.log('Sample HTML:', html.substring(0, 1000));

      // Load HTML with cheerio
      const $ = load(html);
      console.log('Using selector:', selector, '(' + selectorType + ')');

      // Try each noscript tag until we find content
      let $content = $;
      const noscriptTags = $('noscript');
      console.log('Found', noscriptTags.length, 'noscript tags');
      
      for (let i = 0; i < noscriptTags.length; i++) {
        const noscriptContent = $(noscriptTags[i]).html();
        if (noscriptContent) {
          console.log('Checking noscript tag', i + 1);
          const decodedContent = noscriptContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
          const $temp = load(decodedContent);
          const tempElements = $temp(selector);
          if (tempElements.length > 0) {
            console.log('Found', tempElements.length, 'elements in noscript tag', i + 1);
            $content = $temp;
            break;
          }
        }
      }

      // Find elements matching selector
      const elements = $content(selector);
      console.log('Found', elements.length, 'elements matching selector');

      if (elements.length === 0) {
        console.log('No elements found, sample HTML structure:');
        $content('body').children().each((i, el) => {
          console.log(el.tagName, el.attribs.class ? el.attribs.class : 'no-class');
        });
        return [];
      }

      // Extract data from elements
      const results: ScrapedItem[] = [];
      elements.each((i, el) => {
        const item: ScrapedItem = { text: '' };
        attributes.forEach(attr => {
          if (attr === 'text') {
            item.text = $content(el).text().trim();
          } else if (attr === 'html') {
            item.html = $content(el).html()?.trim();
          } else if (attr === 'innerText') {
            item.innerText = $content(el).contents().text().trim();
          } else {
            const value = $content(el).attr(attr);
            if (value) {
              if (attr === 'href' || attr === 'src') {
                item[attr] = this.getAbsoluteUrl(url, value);
              } else {
                item[attr] = value;
              }
            }
          }
          console.log(`Extracted ${attr}:`, item[attr]);
        });

        if (Object.values(item).some(v => v)) {
          console.log('Adding item to results:', item);
          results.push(item);
        }
      });

      console.log('Returning', results.length, 'results:', results);
      return results;
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw error;
    }
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      console.log('Fetching URL with headers:', {
        'User-Agent': this.USER_AGENT
      });

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.USER_AGENT
        }
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL (${response.status}): ${response.statusText}`);
      }

      const text = await response.text();
      console.log(`Response text length: ${text.length}`);
      return text;
    } catch (error) {
      console.error('Error in fetchPage:', error);
      throw error;
    }
  }

  private handleCursorForumPosts($: cheerio.CheerioAPI): ScrapedItem[] {
    try {
      console.log('Starting handleCursorForumPosts');
      const results: ScrapedItem[] = [];
      
      // Get the noscript section that contains the forum posts
      const noscriptHtml = $('noscript').html();
      if (noscriptHtml) {
        console.log('Found noscript section, loading content');
        const $noscript = cheerio.load(noscriptHtml);
        
        // Find all topic links in the forum using the correct selector
        const links = $noscript('td.main-link span.link-top-line a.title.raw-link.raw-topic-link');
        console.log(`Found ${links.length} topic links`);

        links.each((_, element) => {
          const $element = $noscript(element);
          const href = $element.attr('href');
          const text = $element.text().trim();
          const topicId = $element.attr('data-topic-id');
          
          console.log('Processing link:', { href, text, topicId });
          
          if (href?.includes('/t/')) {
            // Extract topic ID and slug
            const topicMatch = href.match(/\/t\/([^\/]+)\/(\d+)/);
            if (topicMatch) {
              const [, slug, id] = topicMatch;
              const item = {
                text,
                href: `https://forum.cursor.com${href}`,
                topicId: topicId || id,
                slug,
                title: text
              };
              console.log('Adding forum post:', item);
              results.push(item);
            }
          }
        });
      } else {
        console.log('No noscript section found');
      }

      console.log(`Returning ${results.length} forum posts`);
      return results;
    } catch (error) {
      console.error('Error in handleCursorForumPosts:', error);
      throw error;
    }
  }

  formatResults(results: ScrapedItem[], template: string = '[{text}]({href})'): string[] {
    try {
      console.log('Formatting results with template:', template);
      console.log('Input results:', results);

      if (!template) {
        const jsonResults = results.map(item => JSON.stringify(item));
        console.log('Formatted as JSON:', jsonResults);
        return jsonResults;
      }

      const formatted = results.map(item => {
        let formatted = template;
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{${key}}`, 'g');
          formatted = formatted.replace(regex, value?.toString() || '');
        });
        return formatted;
      });

      console.log('Formatted results:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error in formatResults:', error);
      throw error;
    }
  }
} 

