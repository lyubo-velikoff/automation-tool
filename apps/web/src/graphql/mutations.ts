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
  mutation ExecuteWorkflow($workflowId: String!, $nodes: [WorkflowNodeInput!]!, $edges: [WorkflowEdgeInput!]!) {
    executeWorkflow(workflowId: $workflowId, nodes: $nodes, edges: $edges) {
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
  mutation UpdateWorkflow($id: String!, $input: UpdateWorkflowInput!) {
    updateWorkflow(id: $id, input: $input) {
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

export const START_TIMED_WORKFLOW = gql`
  mutation StartTimedWorkflow($workflowId: String!, $nodes: [WorkflowNodeInput!]!, $edges: [WorkflowEdgeInput!]!, $intervalMinutes: Int!) {
    startTimedWorkflow(workflowId: $workflowId, nodes: $nodes, edges: $edges, intervalMinutes: $intervalMinutes) {
      success
      message
    }
  }
`;

export const STOP_TIMED_WORKFLOW = gql`
  mutation StopTimedWorkflow($workflowId: String!) {
    stopTimedWorkflow(workflowId: $workflowId) {
      success
      message
    }
  }
`; 
