import { gql } from '@apollo/client';

export const CREATE_WORKFLOW = gql`
  mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
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
          # Scraping fields
          url
          selector
          selectorType
          attribute
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
      __typename
    }
  }
`; 

export const GENERATE_COMPLETION = gql`
  mutation GenerateCompletion($data: CompletionNodeData!) {
    generateCompletion(data: $data)
  }
`;

export const VALIDATE_OPENAI_CONNECTION = gql`
  mutation ValidateOpenAIConnection($apiKey: String!) {
    validateOpenAIConnection(apiKey: $apiKey)
  }
`;

export const EXECUTE_WORKFLOW = gql`
  mutation ExecuteWorkflow($workflowId: String!) {
    executeWorkflow(workflowId: $workflowId) {
      success
      message
      executionId
      results {
        nodeId
        status
        results
      }
    }
  }
`;

export const UPDATE_WORKFLOW = gql`
  mutation UpdateWorkflow($input: UpdateWorkflowInput!) {
    updateWorkflow(input: $input) {
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
          # Scraping fields
          url
          selector
          selectorType
          attribute
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
