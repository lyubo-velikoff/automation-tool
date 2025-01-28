import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { RateLimiter } from 'limiter';
import pLimit from 'p-limit';
import { SelectorConfig, ScrapedItem, BatchConfig, ScrapingResult } from '../types/scraping';

export class ScrapingService {
  private limiter: RateLimiter;

  constructor() {
    // Global rate limiter: 200 requests per 15 minutes (reduced from 250)
    this.limiter = new RateLimiter({
      tokensPerInterval: 200,
      interval: 15 * 60 * 1000 // 15 minutes
    });
  }

  async scrapeUrls(
    urls: string[],
    selector: SelectorConfig,
    selectorType: 'css' | 'xpath',
    attributes: string[],
    batchConfig?: BatchConfig
  ): Promise<ScrapingResult[]> {
    const config = {
      batchSize: batchConfig?.batchSize || 5,
      rateLimit: batchConfig?.rateLimit || 20
    };

    // Create a rate limiter for this batch
    const batchLimiter = new RateLimiter({
      tokensPerInterval: config.rateLimit,
      interval: 60 * 1000 // 1 minute
    });

    // Create a concurrency limiter
    const concurrencyLimit = pLimit(config.batchSize);

    // Process URLs in batches with rate limiting and retries
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
                results: [data]
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
                error: error instanceof Error ? error.message : 'Unknown error occurred'
              };
            }
          }

          return {
            success: false,
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
    try {
      console.log('Sending request to:', url);
      // Add a small delay before each request
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch(url);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      console.log('Response length:', text.length);
      return text;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  formatResults(results: ScrapedItem[], template: string): string[] {
    return results.map(item => {
      let formatted = template;
      console.log('Formatting item:', item); // Debug log
      Object.entries(item).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        console.log(`Replacing ${placeholder} with:`, value); // Debug log
        formatted = formatted.replace(new RegExp(placeholder, 'g'), value);
      });
      return formatted;
    });
  }

  formatBatchResults(results: ScrapingResult[], template?: string): string[] {
    console.log('Formatting batch results:', results); // Debug log
    
    if (!template) {
      // If no template, return the raw text directly from the data
      return results.flatMap(result => {
        console.log('Processing result:', result); // Debug log
        if (result.success && result.results) {
          return result.results.map(item => {
            console.log('Processing item:', item); // Debug log
            // Get the first value from the item
            const value = Object.values(item)[0];
            console.log('Extracted value:', value); // Debug log
            return value || '';
          });
        }
        return [];
      });
    }

    // If template is provided, format each result
    return results.flatMap(result => {
      console.log('Processing result with template:', result); // Debug log
      if (result.success && result.results) {
        return result.results.map(item => {
          let formatted = template;
          console.log('Formatting item:', item); // Debug log
          Object.entries(item).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            console.log(`Replacing ${placeholder} with:`, value); // Debug log
            formatted = formatted.replace(new RegExp(placeholder, 'g'), value);
          });
          return formatted;
        });
      }
      return [];
    });
  }
} 
