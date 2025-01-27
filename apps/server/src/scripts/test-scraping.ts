import { ScrapingService } from '../services/scraping.service';

async function testScraping() {
  try {
    const service = new ScrapingService();
    
    console.log('Testing example.com...');
    const exampleResults = await service.scrapeUrl(
      'https://example.com',
      'h1',
      'css',
      ['text']
    );
    console.log('Example.com results:', exampleResults);

    console.log('\nTesting Cursor forum...');
    const cursorResults = await service.scrapeUrl(
      'https://forum.cursor.com',
      'tr.topic-list-item a[href*="/t/"]',
      'css',
      ['text', 'href', 'data-topic-id']
    );
    console.log('Cursor forum results:', cursorResults);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testForumScraping() {
  const service = new ScrapingService();
  const url = 'https://forum.cursor.com/t/cursor-deepseek/43261';

  // Test different selectors to find the correct one
  const selectors = [
    '.topic-owner .cooked',
    '.topic-post.topic-owner .cooked',
    '.topic-post.topic-owner .post-content',
    '.topic-post.topic-owner .post .cooked',
    'article.topic-post.topic-owner .cooked',
    'article.boxed.topic-owner .cooked'
  ];

  for (const selector of selectors) {
    console.log(`\nTesting selector: ${selector}`);
    try {
      const results = await service.scrapeUrl(
        url,
        selector,
        'css',
        ['text']
      );
      console.log('Results:', results);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

testScraping();
testForumScraping().catch(console.error); 
