import { gql } from '@apollo/client';

export const WORKFLOW_NODE_DATA_FIELDS = gql`
  fragment WorkflowNodeDataFields on NodeData {
    label
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
    attributes
    template
  }
`;

export const WORKFLOW_NODE_FIELDS = gql`
  fragment WorkflowNodeFields on WorkflowNode {
    id
    type
    label
    position {
      x
      y
    }
    data {
      ...WorkflowNodeDataFields
    }
  }
`;

export const WORKFLOW_EDGE_FIELDS = gql`
  fragment WorkflowEdgeFields on WorkflowEdge {
    id
    source
    target
    sourceHandle
    targetHandle
  }
`;

export const WORKFLOW_TAG_FIELDS = gql`
  fragment WorkflowTagFields on WorkflowTag {
    id
    name
    color
    created_at
    updated_at
  }
`;

export const WORKFLOW_FIELDS = gql`
  fragment WorkflowFields on Workflow {
    id
    name
    description
    nodes {
      ...WorkflowNodeFields
    }
    edges {
      ...WorkflowEdgeFields
    }
    is_active
    created_at
    updated_at
    tags {
      ...WorkflowTagFields
    }
  }
  ${WORKFLOW_NODE_FIELDS}
  ${WORKFLOW_NODE_DATA_FIELDS}
  ${WORKFLOW_EDGE_FIELDS}
  ${WORKFLOW_TAG_FIELDS}
`; 
