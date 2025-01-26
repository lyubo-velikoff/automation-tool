/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  fragment WorkflowNodeDataFields on NodeData {\n    label\n    # Gmail fields\n    pollingInterval\n    fromFilter\n    subjectFilter\n    to\n    subject\n    body\n    # Scraping fields\n    url\n    selector\n    selectorType\n    attributes\n    template\n  }\n": types.WorkflowNodeDataFieldsFragmentDoc,
    "\n  fragment WorkflowNodeFields on WorkflowNode {\n    id\n    type\n    label\n    position {\n      x\n      y\n    }\n    data {\n      ...WorkflowNodeDataFields\n    }\n  }\n": types.WorkflowNodeFieldsFragmentDoc,
    "\n  fragment WorkflowEdgeFields on WorkflowEdge {\n    id\n    source\n    target\n    sourceHandle\n    targetHandle\n  }\n": types.WorkflowEdgeFieldsFragmentDoc,
    "\n  fragment WorkflowTagFields on WorkflowTag {\n    id\n    name\n    color\n    created_at\n    updated_at\n  }\n": types.WorkflowTagFieldsFragmentDoc,
    "\n  fragment WorkflowFields on Workflow {\n    id\n    name\n    description\n    nodes {\n      ...WorkflowNodeFields\n    }\n    edges {\n      ...WorkflowEdgeFields\n    }\n    is_active\n    created_at\n    updated_at\n    tags {\n      ...WorkflowTagFields\n    }\n  }\n  \n  \n  \n  \n": types.WorkflowFieldsFragmentDoc,
    "\n  mutation CreateWorkflow($input: CreateWorkflowInput!) {\n    createWorkflow(input: $input) {\n      ...WorkflowFields\n    }\n  }\n  \n": types.CreateWorkflowDocument,
    "\n  mutation ExecuteWorkflow($workflowId: String!) {\n    executeWorkflow(workflowId: $workflowId) {\n      success\n      message\n      executionId\n      results {\n        nodeId\n        status\n        results\n      }\n    }\n  }\n": types.ExecuteWorkflowDocument,
    "\n  mutation UpdateWorkflow($input: UpdateWorkflowInput!) {\n    updateWorkflow(input: $input) {\n      ...WorkflowFields\n    }\n  }\n  \n": types.UpdateWorkflowDocument,
    "\n  mutation StartTimedWorkflow($workflowId: String!, $nodes: [WorkflowNodeInput!]!, $edges: [WorkflowEdgeInput!]!, $intervalMinutes: Int!) {\n    startTimedWorkflow(workflowId: $workflowId, nodes: $nodes, edges: $edges, intervalMinutes: $intervalMinutes)\n  }\n": types.StartTimedWorkflowDocument,
    "\n  mutation StopTimedWorkflow($workflowId: String!) {\n    stopTimedWorkflow(workflowId: $workflowId)\n  }\n": types.StopTimedWorkflowDocument,
    "\n  mutation DeleteWorkflow($id: ID!) {\n    deleteWorkflow(id: $id)\n  }\n": types.DeleteWorkflowDocument,
    "\n  mutation DuplicateWorkflow($id: ID!) {\n    duplicateWorkflow(id: $id) {\n      ...WorkflowFields\n    }\n  }\n  \n": types.DuplicateWorkflowDocument,
    "\n  mutation CreateWorkflowTag($input: CreateWorkflowTagInput!) {\n    createWorkflowTag(input: $input) {\n      ...WorkflowTagFields\n    }\n  }\n  \n": types.CreateWorkflowTagDocument,
    "\n  mutation DeleteWorkflowTag($id: ID!) {\n    deleteWorkflowTag(id: $id)\n  }\n": types.DeleteWorkflowTagDocument,
    "\n  mutation SaveWorkflowAsTemplate($input: SaveAsTemplateInput!) {\n    saveWorkflowAsTemplate(input: $input) {\n      id\n      name\n      description\n      nodes {\n        ...WorkflowNodeFields\n      }\n      edges {\n        ...WorkflowEdgeFields\n      }\n      created_at\n      updated_at\n    }\n  }\n  \n": types.SaveWorkflowAsTemplateDocument,
    "\n  mutation DeleteWorkflowTemplate($id: ID!) {\n    deleteWorkflowTemplate(id: $id)\n  }\n": types.DeleteWorkflowTemplateDocument,
    "\n  query GetWorkflows {\n    workflows {\n      ...WorkflowFields\n    }\n  }\n  \n": types.GetWorkflowsDocument,
    "\n  query GetWorkflow($id: ID!) {\n    workflow(id: $id) {\n      ...WorkflowFields\n    }\n  }\n  \n": types.GetWorkflowDocument,
    "\n  query GetWorkflowTemplates {\n    workflowTemplates {\n      id\n      name\n      description\n      nodes {\n        ...WorkflowNodeFields\n      }\n      edges {\n        ...WorkflowEdgeFields\n      }\n      created_at\n      updated_at\n    }\n  }\n  \n  \n": types.GetWorkflowTemplatesDocument,
    "\n  query GetWorkflowTags {\n    workflowTags {\n      ...WorkflowTagFields\n    }\n  }\n  \n": types.GetWorkflowTagsDocument,
    "\n  query GetWorkflowExecutions($workflowId: ID!) {\n    workflowExecutions(workflowId: $workflowId) {\n      id\n      workflow_id\n      execution_id\n      status\n      results {\n        nodeId\n        status\n        results\n      }\n      created_at\n    }\n  }\n": types.GetWorkflowExecutionsDocument,
    "\n  query IsWorkflowScheduled($workflowId: ID!) {\n    isWorkflowScheduled(workflowId: $workflowId)\n  }\n": types.IsWorkflowScheduledDocument,
    "\n  query TestQuery {\n    workflows {\n      id\n      name\n      description\n    }\n  }\n": types.TestQueryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment WorkflowNodeDataFields on NodeData {\n    label\n    # Gmail fields\n    pollingInterval\n    fromFilter\n    subjectFilter\n    to\n    subject\n    body\n    # Scraping fields\n    url\n    selector\n    selectorType\n    attributes\n    template\n  }\n"): (typeof documents)["\n  fragment WorkflowNodeDataFields on NodeData {\n    label\n    # Gmail fields\n    pollingInterval\n    fromFilter\n    subjectFilter\n    to\n    subject\n    body\n    # Scraping fields\n    url\n    selector\n    selectorType\n    attributes\n    template\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment WorkflowNodeFields on WorkflowNode {\n    id\n    type\n    label\n    position {\n      x\n      y\n    }\n    data {\n      ...WorkflowNodeDataFields\n    }\n  }\n"): (typeof documents)["\n  fragment WorkflowNodeFields on WorkflowNode {\n    id\n    type\n    label\n    position {\n      x\n      y\n    }\n    data {\n      ...WorkflowNodeDataFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment WorkflowEdgeFields on WorkflowEdge {\n    id\n    source\n    target\n    sourceHandle\n    targetHandle\n  }\n"): (typeof documents)["\n  fragment WorkflowEdgeFields on WorkflowEdge {\n    id\n    source\n    target\n    sourceHandle\n    targetHandle\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment WorkflowTagFields on WorkflowTag {\n    id\n    name\n    color\n    created_at\n    updated_at\n  }\n"): (typeof documents)["\n  fragment WorkflowTagFields on WorkflowTag {\n    id\n    name\n    color\n    created_at\n    updated_at\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment WorkflowFields on Workflow {\n    id\n    name\n    description\n    nodes {\n      ...WorkflowNodeFields\n    }\n    edges {\n      ...WorkflowEdgeFields\n    }\n    is_active\n    created_at\n    updated_at\n    tags {\n      ...WorkflowTagFields\n    }\n  }\n  \n  \n  \n  \n"): (typeof documents)["\n  fragment WorkflowFields on Workflow {\n    id\n    name\n    description\n    nodes {\n      ...WorkflowNodeFields\n    }\n    edges {\n      ...WorkflowEdgeFields\n    }\n    is_active\n    created_at\n    updated_at\n    tags {\n      ...WorkflowTagFields\n    }\n  }\n  \n  \n  \n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateWorkflow($input: CreateWorkflowInput!) {\n    createWorkflow(input: $input) {\n      ...WorkflowFields\n    }\n  }\n  \n"): (typeof documents)["\n  mutation CreateWorkflow($input: CreateWorkflowInput!) {\n    createWorkflow(input: $input) {\n      ...WorkflowFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ExecuteWorkflow($workflowId: String!) {\n    executeWorkflow(workflowId: $workflowId) {\n      success\n      message\n      executionId\n      results {\n        nodeId\n        status\n        results\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ExecuteWorkflow($workflowId: String!) {\n    executeWorkflow(workflowId: $workflowId) {\n      success\n      message\n      executionId\n      results {\n        nodeId\n        status\n        results\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateWorkflow($input: UpdateWorkflowInput!) {\n    updateWorkflow(input: $input) {\n      ...WorkflowFields\n    }\n  }\n  \n"): (typeof documents)["\n  mutation UpdateWorkflow($input: UpdateWorkflowInput!) {\n    updateWorkflow(input: $input) {\n      ...WorkflowFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartTimedWorkflow($workflowId: String!, $nodes: [WorkflowNodeInput!]!, $edges: [WorkflowEdgeInput!]!, $intervalMinutes: Int!) {\n    startTimedWorkflow(workflowId: $workflowId, nodes: $nodes, edges: $edges, intervalMinutes: $intervalMinutes)\n  }\n"): (typeof documents)["\n  mutation StartTimedWorkflow($workflowId: String!, $nodes: [WorkflowNodeInput!]!, $edges: [WorkflowEdgeInput!]!, $intervalMinutes: Int!) {\n    startTimedWorkflow(workflowId: $workflowId, nodes: $nodes, edges: $edges, intervalMinutes: $intervalMinutes)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StopTimedWorkflow($workflowId: String!) {\n    stopTimedWorkflow(workflowId: $workflowId)\n  }\n"): (typeof documents)["\n  mutation StopTimedWorkflow($workflowId: String!) {\n    stopTimedWorkflow(workflowId: $workflowId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteWorkflow($id: ID!) {\n    deleteWorkflow(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteWorkflow($id: ID!) {\n    deleteWorkflow(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DuplicateWorkflow($id: ID!) {\n    duplicateWorkflow(id: $id) {\n      ...WorkflowFields\n    }\n  }\n  \n"): (typeof documents)["\n  mutation DuplicateWorkflow($id: ID!) {\n    duplicateWorkflow(id: $id) {\n      ...WorkflowFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateWorkflowTag($input: CreateWorkflowTagInput!) {\n    createWorkflowTag(input: $input) {\n      ...WorkflowTagFields\n    }\n  }\n  \n"): (typeof documents)["\n  mutation CreateWorkflowTag($input: CreateWorkflowTagInput!) {\n    createWorkflowTag(input: $input) {\n      ...WorkflowTagFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteWorkflowTag($id: ID!) {\n    deleteWorkflowTag(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteWorkflowTag($id: ID!) {\n    deleteWorkflowTag(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveWorkflowAsTemplate($input: SaveAsTemplateInput!) {\n    saveWorkflowAsTemplate(input: $input) {\n      id\n      name\n      description\n      nodes {\n        ...WorkflowNodeFields\n      }\n      edges {\n        ...WorkflowEdgeFields\n      }\n      created_at\n      updated_at\n    }\n  }\n  \n"): (typeof documents)["\n  mutation SaveWorkflowAsTemplate($input: SaveAsTemplateInput!) {\n    saveWorkflowAsTemplate(input: $input) {\n      id\n      name\n      description\n      nodes {\n        ...WorkflowNodeFields\n      }\n      edges {\n        ...WorkflowEdgeFields\n      }\n      created_at\n      updated_at\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteWorkflowTemplate($id: ID!) {\n    deleteWorkflowTemplate(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteWorkflowTemplate($id: ID!) {\n    deleteWorkflowTemplate(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWorkflows {\n    workflows {\n      ...WorkflowFields\n    }\n  }\n  \n"): (typeof documents)["\n  query GetWorkflows {\n    workflows {\n      ...WorkflowFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWorkflow($id: ID!) {\n    workflow(id: $id) {\n      ...WorkflowFields\n    }\n  }\n  \n"): (typeof documents)["\n  query GetWorkflow($id: ID!) {\n    workflow(id: $id) {\n      ...WorkflowFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWorkflowTemplates {\n    workflowTemplates {\n      id\n      name\n      description\n      nodes {\n        ...WorkflowNodeFields\n      }\n      edges {\n        ...WorkflowEdgeFields\n      }\n      created_at\n      updated_at\n    }\n  }\n  \n  \n"): (typeof documents)["\n  query GetWorkflowTemplates {\n    workflowTemplates {\n      id\n      name\n      description\n      nodes {\n        ...WorkflowNodeFields\n      }\n      edges {\n        ...WorkflowEdgeFields\n      }\n      created_at\n      updated_at\n    }\n  }\n  \n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWorkflowTags {\n    workflowTags {\n      ...WorkflowTagFields\n    }\n  }\n  \n"): (typeof documents)["\n  query GetWorkflowTags {\n    workflowTags {\n      ...WorkflowTagFields\n    }\n  }\n  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWorkflowExecutions($workflowId: ID!) {\n    workflowExecutions(workflowId: $workflowId) {\n      id\n      workflow_id\n      execution_id\n      status\n      results {\n        nodeId\n        status\n        results\n      }\n      created_at\n    }\n  }\n"): (typeof documents)["\n  query GetWorkflowExecutions($workflowId: ID!) {\n    workflowExecutions(workflowId: $workflowId) {\n      id\n      workflow_id\n      execution_id\n      status\n      results {\n        nodeId\n        status\n        results\n      }\n      created_at\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query IsWorkflowScheduled($workflowId: ID!) {\n    isWorkflowScheduled(workflowId: $workflowId)\n  }\n"): (typeof documents)["\n  query IsWorkflowScheduled($workflowId: ID!) {\n    isWorkflowScheduled(workflowId: $workflowId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TestQuery {\n    workflows {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query TestQuery {\n    workflows {\n      id\n      name\n      description\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;