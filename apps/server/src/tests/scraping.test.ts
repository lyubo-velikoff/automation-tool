import { ScrapingService } from '../integrations/scraping/service';
import { ScrapingNode, ScrapingNodeData } from '../integrations/scraping/nodes/ScrapingNode';

describe('Scraping Service', () => {
  let scrapingService: ScrapingService;

  beforeEach(() => {
    scrapingService = new ScrapingService();
  });

  describe('Cursor Forum Scraping', () => {
    it('should scrape forum posts using special handler', async () => {
      const results = await scrapingService.scrapeUrl(
        'https://forum.cursor.com',
        'forum-posts',
        'css',
        ['text', 'href', 'topicId', 'slug', 'title']
      );

      // Verify results structure
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('href');
        expect(result).toHaveProperty('topicId');
        expect(result).toHaveProperty('slug');
        expect(result).toHaveProperty('title');
        
        // Verify URL format
        expect(result.href).toMatch(/^https:\/\/forum\.cursor\.com\/t\//);
        // Verify topic ID is numeric
        expect(result.topicId).toMatch(/^\d+$/);
      });
    });

    it('should format results using template', async () => {
      const results = await scrapingService.scrapeUrl(
        'https://forum.cursor.com',
        'forum-posts',
        'css',
        ['text', 'href', 'topicId']
      );

      const formatted = scrapingService.formatResults(
        results,
        '- [{text}]({href}) (ID: {topicId})'
      );

      // Verify formatting
      expect(formatted.length).toBeGreaterThan(0);
      formatted.forEach(item => {
        expect(item).toMatch(/^- \[.+\]\(https:\/\/forum\.cursor\.com\/t\/.+\) \(ID: \d+\)$/);
      });
    });
  });

  describe('ScrapingNode Integration', () => {
    it('should execute scraping workflow node', async () => {
      const config: ScrapingNodeData = {
        url: 'https://forum.cursor.com',
        selectors: [
          {
            selector: 'forum-posts',
            selectorType: 'css',
            attributes: ['text', 'href', 'topicId', 'slug', 'title'],
            name: 'Forum Posts'
          }
        ],
        outputTemplate: '- [{title}]({href})'
      };

      const node = new ScrapingNode('test-user', config);
      const result = await node.execute({});

      // Verify execution result
      expect(result.success).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();

      // Verify formatted output
      result.results.forEach(item => {
        expect(item).toMatch(/^- \[.+\]\(https:\/\/forum\.cursor\.com\/t\/.+\)$/);
      });
    });

    it('should handle errors gracefully', async () => {
      const config: ScrapingNodeData = {
        url: 'https://invalid-url-that-does-not-exist.com',
        selectors: [
          {
            selector: '.some-selector',
            selectorType: 'css',
            attributes: ['text'],
            name: 'Invalid Test'
          }
        ]
      };

      const node = new ScrapingNode('test-user', config);
      const result = await node.execute({});

      // Verify error handling
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(0);
      expect(result.error).toBeDefined();
    });
  });
}); 
