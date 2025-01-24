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
        sourceHandle
        targetHandle
      }
      is_active
      created_at
      updated_at
      tags {
        id
        name
        color
      }
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
        }
      }
      edges {
        id
        source
        target
        sourceHandle
        targetHandle
      }
      is_active
      created_at
      updated_at
      tags {
        id
        name
        color
      }
    }
  }
`; 

export const START_TIMED_WORKFLOW = gql`
  mutation StartTimedWorkflow($workflowId: String!, $nodes: [WorkflowNodeInput!]!, $edges: [WorkflowEdgeInput!]!, $intervalMinutes: Int!) {
    startTimedWorkflow(workflowId: $workflowId, nodes: $nodes, edges: $edges, intervalMinutes: $intervalMinutes)
  }
`;

export const STOP_TIMED_WORKFLOW = gql`
  mutation StopTimedWorkflow($workflowId: String!) {
    stopTimedWorkflow(workflowId: $workflowId)
  }
`;

export const DELETE_WORKFLOW = gql`
  mutation DeleteWorkflow($id: ID!) {
    deleteWorkflow(id: $id)
  }
`;

export const DUPLICATE_WORKFLOW = gql`
  mutation DuplicateWorkflow($workflowId: String!) {
    duplicateWorkflow(workflowId: $workflowId) {
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
        }
      }
      edges {
        id
        source
        target
        sourceHandle
        targetHandle
      }
      user_id
      is_active
      created_at
      updated_at
      tags {
        id
        name
        color
      }
    }
  }
`; 

export const CREATE_WORKFLOW_TAG = gql`
  mutation CreateWorkflowTag($input: CreateWorkflowTagInput!) {
    createWorkflowTag(input: $input) {
      id
      name
      color
      created_at
      updated_at
    }
  }
`;

export const DELETE_WORKFLOW_TAG = gql`
  mutation DeleteWorkflowTag($id: ID!) {
    deleteWorkflowTag(id: $id)
  }
`;

export const SAVE_AS_TEMPLATE = gql`
  mutation SaveAsTemplate($input: SaveAsTemplateInput!) {
    saveAsTemplate(input: $input) {
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
        }
      }
      edges {
        id
        source
        target
        sourceHandle
        targetHandle
      }
      created_at
      updated_at
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE = gql`
  mutation DeleteWorkflowTemplate($id: ID!) {
    deleteWorkflowTemplate(id: $id)
  }
`; 
