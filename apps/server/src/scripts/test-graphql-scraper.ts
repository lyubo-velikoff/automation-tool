import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

const testScraperQuery = `
query ScrapeForum($url: String!, $selectors: [SelectorConfigInput!]!, $outputTemplate: String) {
  scrapeUrl(
    url: $url,
    selectors: $selectors,
    outputTemplate: $outputTemplate
  ) {
    success
    results
    error
  }
}`;

async function runTest(description: string, url: string, selectors: any[], outputTemplate: string) {
  console.log(`\n${description}:`);
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: testScraperQuery,
      variables: { url, selectors, outputTemplate }
    })
  });

  const data = await response.json();
  console.log('\nResults:');
  console.log('Success:', data.data?.scrapeUrl?.success);
  
  if (data.data?.scrapeUrl?.error) {
    console.log('Error:', data.data.scrapeUrl.error);
    return;
  }

  const results = data.data?.scrapeUrl?.results || [];
  if (results.length === 0) {
    console.log('No results found');
    return;
  }

  console.log('First 5 results:');
  const cleanResults = results.map((result: string) => 
    result.replace(/\s+/g, ' ').trim()
  );
  console.log(cleanResults.slice(0, 5).join('\n'));
}

async function testGraphQLScraper() {
  console.log('Starting GraphQL scraper test...');

  try {
    // Test Case 1: Basic HTML Elements
    await runTest(
      '1. Testing basic HTML scraping',
      'https://example.com',
      [{
        selector: 'h1',
        selectorType: 'css',
        attributes: ['text'],
        name: 'Main Heading'
      }],
      '- {text}'
    );

    // Test Case 2: GitHub Trending Repositories
    await runTest(
      '2. Testing GitHub trending repositories',
      'https://github.com/trending',
      [{
        selector: 'h2.h3.lh-condensed',
        selectorType: 'css',
        attributes: ['text'],
        name: 'Repository Names'
      }],
      '- {text}'
    );

    // Test Case 3: GitHub Trending with Links
    await runTest(
      '3. Testing GitHub trending with links',
      'https://github.com/trending',
      [{
        selector: 'h2.h3.lh-condensed a',
        selectorType: 'css',
        attributes: ['text', 'href'],
        name: 'Repository Links'
      }],
      '- [{text}]({href})'
    );

    // Test Case 4: Multiple Selectors
    await runTest(
      '4. Testing multiple selectors',
      'https://github.com/trending',
      [
        {
          selector: 'h2.h3.lh-condensed',
          selectorType: 'css',
          attributes: ['text'],
          name: 'Repository Names'
        },
        {
          selector: '.color-fg-muted.d-inline-block.ml-0.mr-3',
          selectorType: 'css',
          attributes: ['text'],
          name: 'Programming Languages'
        }
      ],
      '- {text}'
    );

    // Test Case 5: Error Handling (Invalid URL)
    await runTest(
      '5. Testing error handling with invalid URL',
      'https://invalid-url-that-does-not-exist.com',
      [{
        selector: 'div',
        selectorType: 'css',
        attributes: ['text'],
        name: 'Error Test'
      }],
      '- {text}'
    );

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testGraphQLScraper().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 
