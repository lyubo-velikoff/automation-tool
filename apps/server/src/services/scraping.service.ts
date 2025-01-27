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
  success: boolean;
  data?: { [key: string]: string };
  error?: string;
}

export class ScrapingService {
  private limiter: RateLimiter;

  constructor() {
    // Global rate limiter: 300 requests per 15 minutes
    this.limiter = new RateLimiter({
      tokensPerInterval: 300,
      interval: 15 * 60 * 1000 // 15 minutes
    });
  }

  async scrapeUrls(
    urls: string[],
    selectors: { selector: string; selectorType: 'css' | 'xpath'; attributes: string[]; name: string }[],
    _selectorType?: 'css' | 'xpath',
    _attributes?: string[],
    batchConfig?: BatchConfig
  ): Promise<ScrapingResult[]> {
    const config = {
      batchSize: batchConfig?.batchSize || 10,
      rateLimit: batchConfig?.rateLimit || 30
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

              const data: { [key: string]: string } = {};
              
              // Process each selector using the same Cheerio instance
              for (const selector of selectors) {
                console.log(`Processing selector: ${selector.selector}`);
                let elements;
                if (selector.selectorType === 'xpath') {
                  // TODO: Implement XPath support
                  throw new Error('XPath selectors not yet supported');
                } else {
                  elements = $(selector.selector);
                }

                console.log(`Found ${elements.length} elements matching selector: ${selector.selector}`);
                if (elements.length === 0) {
                  console.log('HTML snippet around where elements should be:');
                  const bodyText = $('body').html()?.substring(0, 500) || 'No body found';
                  console.log(bodyText);
                  continue;
                }

                // Take the first element's data
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
              }

              return {
                success: true,
                data
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
    attributes: string[] = ['text']
  ): Promise<ScrapedItem[]> {
    console.log('Scraping URL:', url);
    console.log('Using selector:', selector);
    console.log('Selector type:', selectorType);
    console.log('Extracting attributes:', attributes);

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
        console.log('HTML snippet around where elements should be:');
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
            item[attr] = text;
          } else if (attr === 'html') {
            const html = $(el).html() || '';
            console.log('Extracted HTML:', html);
            item[attr] = html;
          } else {
            const value = $(el).attr(attr);
            console.log(`Extracted ${attr}:`, value);
            if (value) {
              item[attr] = value;
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
        result.success && result.data ? JSON.stringify(result.data) : `Error: ${result.error || 'Unknown error'}`
      );
    }

    return results.flatMap(result => {
      if (!result.success || !result.data) {
        return [`Error: ${result.error || 'Unknown error'}`];
      }
      return this.formatResults([result.data], template);
    });
  }
} 
