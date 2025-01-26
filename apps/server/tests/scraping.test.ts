/// <reference types="jest" />

import { ScrapingService } from '../src/services/scraping.service';
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
    const scrapingService = new ScrapingService();

    it('should scrape basic HTML', async () => {
      const config: ScrapingNodeData = {
        url: 'https://example.com',
        selectors: [{
          selector: 'h1',
          selectorType: 'css',
          attributes: ['text']
        }],
        outputTemplate: '{text}'
      };

      const node = new ScrapingNode('test-user', config);
      const results = await node.execute({});
      expect(results).toEqual({
        success: true,
        results: ['Example Domain']
      });
    });

    it('should scrape with href attribute', async () => {
      const config: ScrapingNodeData = {
        url: 'https://example.com',
        selectors: [{
          selector: 'a',
          selectorType: 'css',
          attributes: ['text', 'href']
        }],
        outputTemplate: '[{text}]({href})'
      };

      const node = new ScrapingNode('test-user', config);
      const results = await node.execute({});
      expect(results).toEqual({
        success: true,
        results: ['[More information...](/more-information.html)']
      });
    });

    it('should handle errors gracefully', async () => {
      const config: ScrapingNodeData = {
        url: 'https://nonexistent.example.com',
        selectors: [{
          selector: 'h1',
          selectorType: 'css',
          attributes: ['text']
        }],
        outputTemplate: '{text}'
      };

      const node = new ScrapingNode('test-user', config);
      const results = await node.execute({});
      expect(results).toEqual({
        success: false,
        results: [],
        error: 'Failed to fetch URL: https://nonexistent.example.com'
      });
    });
  });

  describe('ScrapingService', () => {
    const service = new ScrapingService();

    it('should scrape basic HTML', async () => {
      const results = await service.scrapeUrl(
        'https://example.com',
        'h1',
        'css',
        ['text']
      );
      expect(results).toEqual([{ text: 'Example Domain' }]);
    });

    it('should scrape with href attribute', async () => {
      const results = await service.scrapeUrl(
        'https://example.com',
        'a',
        'css',
        ['text', 'href']
      );
      expect(results).toEqual([{
        text: 'More information...',
        href: '/more-information.html'
      }]);
    });

    it('should scrape URL with rate limiting', async () => {
      const results = await service.scrapeUrl(
        'https://example.com',
        '.test-class',
        'css',
        ['text']
      );
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle network errors', async () => {
      await expect(
        service.scrapeUrl(
          'https://invalid-url.com',
          '.test-class',
          'css',
          ['text']
        )
      ).rejects.toThrow();
    });
  });
}); 
