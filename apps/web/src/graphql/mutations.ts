import { gql } from '@apollo/client';
import {
  WORKFLOW_FIELDS,
  WORKFLOW_TAG_FIELDS
} from './fragments';

export const CREATE_WORKFLOW = gql`
  mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
      ...WorkflowFields
    }
  }
  ${WORKFLOW_FIELDS}
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
      ...WorkflowFields
    }
  }
  ${WORKFLOW_FIELDS}
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
  mutation DuplicateWorkflow($id: ID!, $name: String) {
    duplicateWorkflow(id: $id, name: $name) {
      ...WorkflowFields
    }
  }
  ${WORKFLOW_FIELDS}
`;

export const CREATE_WORKFLOW_TAG = gql`
  mutation CreateWorkflowTag($input: CreateWorkflowTagInput!) {
    createWorkflowTag(input: $input) {
      ...WorkflowTagFields
    }
  }
  ${WORKFLOW_TAG_FIELDS}
`;

export const DELETE_WORKFLOW_TAG = gql`
  mutation DeleteWorkflowTag($id: ID!) {
    deleteWorkflowTag(id: $id)
  }
`;

export const SAVE_AS_TEMPLATE = gql`
  mutation SaveWorkflowAsTemplate($input: SaveAsTemplateInput!) {
    saveWorkflowAsTemplate(input: $input) {
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
  ${WORKFLOW_FIELDS}
`;

export const DELETE_WORKFLOW_TEMPLATE = gql`
  mutation DeleteWorkflowTemplate($id: ID!) {
    deleteWorkflowTemplate(id: $id)
  }
`; 
