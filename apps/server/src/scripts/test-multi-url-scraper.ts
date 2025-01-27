import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

const testMultiScraperQuery = `
query ScrapeMultipleUrls($urls: [String!]!, $selector: SelectorConfigInput!, $batchConfig: BatchConfigInput, $template: String) {
  scrapeMultipleUrls(
    urls: $urls,
    selector: $selector,
    batchConfig: $batchConfig,
    template: $template
  ) {
    success
    results
    error
  }
}`;

async function runTest(description: string, urls: string[], selectors: any[], batchConfig?: any, template?: string) {
  console.log(`\n${description}:`);
  try {
    console.log('Sending request with:', {
      urls: urls.length > 3 ? `${urls.length} URLs` : urls,
      selector: selectors[0],
      batchConfig,
      template
    });

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testMultiScraperQuery,
        variables: { 
          urls, 
          selector: selectors[0],
          batchConfig,
          template 
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();
    if (data.errors) {
      console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      return false;
    }

    const result = data.data?.scrapeMultipleUrls;
    console.log('\nResults:');
    console.log('Success:', result?.success);
    
    if (result?.error) {
      console.log('Error:', result.error);
      return false;
    }

    const results = result?.results || [];
    if (results.length === 0) {
      console.log('No results found');
      return false;
    }

    // Only show first 5 results to keep output clean
    console.log(`Found ${results.length} results. First 5:`);
    const cleanResults = results
      .map((result: string) => result.replace(/\s+/g, ' ').trim())
      .slice(0, 5);
    console.log(cleanResults.join('\n'));
    console.log('Test completed successfully');
    return true;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
    } else {
      console.error('Network or execution error:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

async function testMultiUrlScraper() {
  console.log('Starting Multi-URL scraper test...');
  let allTestsPassed = true;

  try {
    // Test Case 1: Multiple Simple URLs
    console.log('\nRunning Test Case 1...');
    allTestsPassed = await runTest(
      '1. Testing multiple simple URLs',
      ['https://example.com', 'https://example.org'],
      [{
        selector: 'h1',
        selectorType: 'css',
        attributes: ['text'],
        name: 'Main Heading'
      }],
      {
        batchSize: 2,
        rateLimit: 5
      },
      '{{url}}: {{text}}'
    ) && allTestsPassed;

    // Test Case 2: GitHub Trending Multiple Days
    console.log('\nRunning Test Case 2...');
    const githubUrls = [
      'https://github.com/trending',
      'https://github.com/trending/javascript',
      'https://github.com/trending/typescript'
    ];
    allTestsPassed = await runTest(
      '2. Testing GitHub trending for multiple languages',
      githubUrls,
      [{
        selector: 'h2.h3.lh-condensed',
        selectorType: 'css',
        attributes: ['text'],
        name: 'Repository Names'
      }],
      {
        batchSize: 2,
        rateLimit: 3
      },
      '{{url}} - {{text}}'
    ) && allTestsPassed;

    // Test Case 3: Error Handling (Mixed Valid/Invalid URLs)
    console.log('\nRunning Test Case 3...');
    allTestsPassed = await runTest(
      '3. Testing error handling with mixed URLs',
      [
        'https://example.com',
        'https://invalid-url-that-does-not-exist.com',
        'https://example.org'
      ],
      [{
        selector: 'h1',
        selectorType: 'css',
        attributes: ['text'],
        name: 'Error Test'
      }],
      {
        batchSize: 1,
        rateLimit: 2
      }
    ) && allTestsPassed;

    // Test Case 4: Rate Limiting Test
    console.log('\nRunning Test Case 4...');
    allTestsPassed = await runTest(
      '4. Testing rate limiting',
      Array(5).fill('https://example.com'),
      [{
        selector: 'h1',
        selectorType: 'css',
        attributes: ['text']
      }],
      {
        batchSize: 2,
        rateLimit: 2
      }
    ) && allTestsPassed;

    if (allTestsPassed) {
      console.log('\nAll tests completed successfully');
    } else {
      console.log('\nSome tests failed');
    }
    return allTestsPassed;
  } catch (error) {
    console.error('Test suite failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

// Run the test and exit explicitly
testMultiUrlScraper().then((success) => {
  console.log('\nTest suite completed');
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}); 
