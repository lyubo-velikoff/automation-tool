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
          attributes
          template
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

export const GET_WORKFLOW = gql`
  query GetWorkflow($id: ID!) {
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
          attributes
          template
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

export const GET_WORKFLOW_TEMPLATES = gql`
  query GetWorkflowTemplates {
    workflowTemplates {
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

export const GET_WORKFLOW_TAGS = gql`
  query GetWorkflowTags {
    workflowTags {
      id
      name
      color
      created_at
      updated_at
    }
  }
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
