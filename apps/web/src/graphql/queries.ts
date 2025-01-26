import { gql } from '@apollo/client';
import {
  WORKFLOW_FIELDS,
  WORKFLOW_TAG_FIELDS,
  WORKFLOW_NODE_FIELDS,
  WORKFLOW_EDGE_FIELDS
} from './fragments';

export const GET_WORKFLOWS = gql`
  query GetWorkflows {
    workflows {
      ...WorkflowFields
    }
  }
  ${WORKFLOW_FIELDS}
`;

export const GET_WORKFLOW = gql`
  query GetWorkflow($id: ID!) {
    workflow(id: $id) {
      ...WorkflowFields
    }
  }
  ${WORKFLOW_FIELDS}
`;

export const GET_WORKFLOW_TEMPLATES = gql`
  query GetWorkflowTemplates {
    workflowTemplates {
      id
      name
      description
      nodes {
        ...WorkflowNodeFields
      }
      edges {
        ...WorkflowEdgeFields
      }
      created_at
      updated_at
    }
  }
  ${WORKFLOW_NODE_FIELDS}
  ${WORKFLOW_EDGE_FIELDS}
`;

export const GET_WORKFLOW_TAGS = gql`
  query GetWorkflowTags {
    workflowTags {
      ...WorkflowTagFields
    }
  }
  ${WORKFLOW_TAG_FIELDS}
`;

export const GET_WORKFLOW_EXECUTIONS = gql`
  query GetWorkflowExecutions($workflowId: ID!) {
    workflowExecutions(workflowId: $workflowId) {
      id
      workflow_id
      execution_id
      status
      results {
        nodeId
        status
        results
      }
      created_at
    }
  }
`;

export const IS_WORKFLOW_SCHEDULED = gql`
  query IsWorkflowScheduled($workflowId: ID!) {
    isWorkflowScheduled(workflowId: $workflowId)
  }
`; 
