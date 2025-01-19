/// <reference types="jest" />

import { ScrapingService } from '../src/integrations/scraping/service';
import { ScrapingNode, ScrapingNodeData } from '../src/integrations/scraping/nodes/ScrapingNode';

interface MockElement {
  text?: string;
  attribs?: Record<string, string>;
}

interface CheerioElement {
  text: () => string;
  attr: (name?: string) => string | undefined;
  each: (callback: (index: number, element: any) => void) => CheerioElement;
  length: number;
}

interface ElementMap {
  [key: string]: CheerioElement;
}

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(() => {
    const createCheerioElement = (text: string, attrs: Record<string, string> = {}): CheerioElement => ({
      text: () => text,
      attr: (name?: string) => attrs[name || ''],
      each: function(callback: (index: number, element: any) => void) {
        callback(0, { text: text, attribs: attrs });
        return this;
      },
      length: 1
    });

    const $ = function(selector: string | { text: string; attribs: Record<string, string> }): CheerioElement {
      if (typeof selector === 'object') {
        return createCheerioElement(selector.text, selector.attribs);
      }

      const elements: ElementMap = {
        '.test-class': createCheerioElement('Test content'),
        '#test-id': createCheerioElement('', { href: 'test-attribute' })
      };
      
      return elements[selector] || createCheerioElement('', {});
    };

    return $;
  })
}));

// Mock node-fetch
jest.mock('node-fetch', () => 
  jest.fn((url: string) => 
    Promise.resolve({
      ok: !url.includes('invalid-url'),
      text: () => Promise.resolve('<html><body><div class="test-class">Test content</div><div id="test-id" href="test-attribute"></div></body></html>')
    })
  )
);

describe('Web Scraping Integration', () => {
  const mockUserId = 'test-user-123';

  describe('ScrapingNode', () => {
    it('should scrape content using CSS selector', async () => {
      const config: ScrapingNodeData = {
        url: 'https://example.com',
        selector: '.test-class',
        selectorType: 'css',
        attribute: 'text'
      };

      const scrapingNode = new ScrapingNode(mockUserId, config);
      const result = await scrapingNode.execute({});

      expect(result.success).toBe(true);
      expect(result.results).toContain('Test content');
    });

    it('should scrape attribute using CSS selector', async () => {
      const config: ScrapingNodeData = {
        url: 'https://example.com',
        selector: '#test-id',
        selectorType: 'css',
        attribute: 'href'
      };

      const scrapingNode = new ScrapingNode(mockUserId, config);
      const result = await scrapingNode.execute({});

      expect(result.success).toBe(true);
      expect(result.results).toContain('test-attribute');
    });

    it('should handle invalid selectors gracefully', async () => {
      const config: ScrapingNodeData = {
        url: 'https://example.com',
        selector: '.non-existent',
        selectorType: 'css',
        attribute: 'text'
      };

      const scrapingNode = new ScrapingNode(mockUserId, config);
      const result = await scrapingNode.execute({});

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('ScrapingService', () => {
    it('should scrape URL with rate limiting', async () => {
      const service = new ScrapingService();
      const results = await service.scrapeUrl(
        'https://example.com',
        '.test-class',
        'css',
        'text'
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results).toContain('Test content');
    });

    it('should handle network errors', async () => {
      const service = new ScrapingService();
      await expect(
        service.scrapeUrl(
          'https://invalid-url.com',
          '.test-class',
          'css',
          'text'
        )
      ).rejects.toThrow();
    });
  });
}); 
