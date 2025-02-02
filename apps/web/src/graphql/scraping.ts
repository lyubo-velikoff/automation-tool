import { gql } from '@apollo/client';

export const TEST_SCRAPING = gql`
  mutation TestScraping($url: String!, $selectors: [SelectorConfigInput!]!) {
    testScraping(url: $url, selectors: $selectors) {
      success
      error
      results
    }
  }
`; 
