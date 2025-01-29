import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';
import pLimit from 'p-limit';
import { 
  SelectorConfig, 
  ScrapedItem, 
  BatchConfig, 
  ScrapingResult 
} from '../types/scraping';

export class ScrapingService {
  private limiter: RateLimiter;

  constructor() {
    // Global rate limiter: 10 requests per second
    this.limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
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
    const batchSize = batchConfig?.batchSize || 5;
    const rateLimit = batchConfig?.rateLimit || 2;

    // Create a batch-specific rate limiter
    const batchLimiter = new RateLimiter({ tokensPerInterval: rateLimit, interval: 'second' });
    const concurrencyLimit = pLimit(batchSize);

    const results = await Promise.all(
      urls.map(url =>
        concurrencyLimit(async () => {
          const maxRetries = 3;
          let retryCount = 0;

          while (retryCount < maxRetries) {
            try {
              // Wait for both limiters with a timeout
              const [globalTokens, batchTokens] = await Promise.all([
                this.limiter.removeTokens(1).catch(() => false),
                batchLimiter.removeTokens(1).catch(() => false)
              ]);

              if (!globalTokens || !batchTokens) {
                // If rate limited, wait and retry
                await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1)));
                retryCount++;
                continue;
              }

              // Fetch the page once
              console.log('Fetching page:', url);
              const html = await this.fetchPage(url);
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
                continue;
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
              if (retryCount < maxRetries - 1) {
                console.log(`Retrying ${url} (attempt ${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1)));
                retryCount++;
                continue;
              }
              console.error(`Error scraping ${url} after ${maxRetries} attempts:`, error);
              return {
                success: false,
                results: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
              };
            }
          }

          return {
            success: false,
            results: [],
            error: `Failed after ${maxRetries} retries`
          };
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
    console.log('Using selector name:', selectorName);

    try {
      console.log('Fetching page...');
      const html = await this.fetchPage(url);
      console.log('Page fetched, length:', html.length);
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
      if (elements.length === 0) {
        const bodyText = $('body').html()?.substring(0, 500) || 'No body found';
        console.log(bodyText);
      }

      const results: ScrapedItem[] = [];
      elements.each((_, el) => {
        const item: ScrapedItem = {};
        
        attributes.forEach(attr => {
          if (attr === 'text') {
            const text = $(el).text().trim();
            console.log('Extracted text:', text);
            item[selectorName] = text;
          } else if (attr === 'html') {
            const html = $(el).html() || '';
            console.log('Extracted HTML:', html);
            item[selectorName] = html;
          } else {
            const value = $(el).attr(attr);
            console.log(`Extracted ${attr}:`, value);
            if (value) {
              item[selectorName] = value;
            }
          }
        });

        if (Object.keys(item).length > 0) {
          results.push(item);
        }
      });

      console.log('Final results:', JSON.stringify(results, null, 2));
      return results;
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw error;
    }
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
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
} 
