import { ScrapingService } from '../services/scraping.service';
import { ScrapingNode, ScrapingNodeData } from '../integrations/scraping/nodes/ScrapingNode';

async function testScraper() {
  console.log('Starting scraper test...');
  
  const scrapingService = new ScrapingService();
  
  try {
    // Test direct service usage
    console.log('\n1. Testing direct service usage:');
    const results = await scrapingService.scrapeUrl(
      'https://forum.cursor.com',
      'forum-posts',
      'css',
      ['text', 'href', 'topicId', 'slug', 'title']
    );

    console.log(`Found ${results.length} posts`);
    console.log('First 3 results:');
    console.log(JSON.stringify(results.slice(0, 3), null, 2));

    // Test with formatting
    console.log('\n2. Testing with formatting:');
    const formatted = scrapingService.formatResults(
      results,
      '- [{title}]({href}) (ID: {topicId})'
    );
    console.log('First 3 formatted results:');
    formatted.slice(0, 3).forEach(item => console.log(item));

    // Test node execution
    console.log('\n3. Testing node execution:');
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
      outputTemplate: '- [{title}]({href}) (Topic ID: {topicId})'
    };

    const node = new ScrapingNode('test-user', config);
    const nodeResult = await node.execute({});

    console.log('Node execution success:', nodeResult.success);
    console.log('First 3 node results:');
    nodeResult.results.slice(0, 3).forEach(item => console.log(item));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testScraper().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 
