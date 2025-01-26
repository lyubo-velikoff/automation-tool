import { gql } from '@apollo/client';

export const TEST_QUERY = gql`
  query TestQuery {
    workflows {
      id
      name
      description
    }
  }
`; 
