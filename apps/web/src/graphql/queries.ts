import { gql } from '@apollo/client';

export const GET_WORKFLOWS = gql`
  query GetWorkflows {
    workflows {
      id
      name
      description
      nodes {
        id
        type
        label
        position {
          x
          y
        }
        data {
          # Gmail fields
          pollingInterval
          fromFilter
          subjectFilter
          to
          subject
          body
          # OpenAI fields
          prompt
          model
          maxTokens
          # Scraping fields
          url
          selector
          selectorType
          attribute
          # Common fields
          label
        }
      }
      edges {
        id
        source
        target
      }
      is_active
      created_at
      updated_at
    }
  }
`;

export const GET_WORKFLOW = gql`
  query GetWorkflow($id: String!) {
    workflow(id: $id) {
      id
      name
      description
      nodes {
        id
        type
        label
        position {
          x
          y
        }
        data {
          pollingInterval
          fromFilter
          subjectFilter
          to
          subject
          body
          prompt
          model
          maxTokens
          url
          selector
          selectorType
          attribute
          label
        }
      }
      edges {
        id
        source
        target
      }
      user_id
      is_active
      created_at
      updated_at
    }
  }
`; 
