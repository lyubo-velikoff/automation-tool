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

testScraping(); 
