/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: string; output: string; }
};

export type CreateWorkflowInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  edges: Array<WorkflowEdgeInput>;
  name: Scalars['String']['input'];
  nodes: Array<WorkflowNodeInput>;
  tag_ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateWorkflowTagInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type ExecutionResult = {
  __typename?: 'ExecutionResult';
  executionId?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  results?: Maybe<Array<NodeResult>>;
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createScrapingNode: ScrapingNode;
  createWorkflow: Workflow;
  createWorkflowTag: WorkflowTag;
  deleteWorkflow: Scalars['Boolean']['output'];
  deleteWorkflowTag: Scalars['Boolean']['output'];
  deleteWorkflowTemplate: Scalars['Boolean']['output'];
  duplicateWorkflow: Workflow;
  executeWorkflow: ExecutionResult;
  saveWorkflowAsTemplate: WorkflowTemplate;
  startTimedWorkflow: Scalars['Boolean']['output'];
  stopTimedWorkflow: Scalars['Boolean']['output'];
  updateWorkflow: Workflow;
};


export type MutationCreateScrapingNodeArgs = {
  data: ScrapingNodeDataInput;
};


export type MutationCreateWorkflowArgs = {
  input: CreateWorkflowInput;
};


export type MutationCreateWorkflowTagArgs = {
  input: CreateWorkflowTagInput;
};


export type MutationDeleteWorkflowArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkflowTagArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkflowTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDuplicateWorkflowArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExecuteWorkflowArgs = {
  workflowId: Scalars['String']['input'];
};


export type MutationSaveWorkflowAsTemplateArgs = {
  input: SaveAsTemplateInput;
};


export type MutationStartTimedWorkflowArgs = {
  edges: Array<WorkflowEdgeInput>;
  intervalMinutes: Scalars['Int']['input'];
  nodes: Array<WorkflowNodeInput>;
  workflowId: Scalars['String']['input'];
};


export type MutationStopTimedWorkflowArgs = {
  workflowId: Scalars['String']['input'];
};


export type MutationUpdateWorkflowArgs = {
  input: UpdateWorkflowInput;
};

export type NodeData = {
  __typename?: 'NodeData';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes?: Maybe<Array<Scalars['String']['output']>>;
  body?: Maybe<Scalars['String']['output']>;
  fromFilter?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  maxTokens?: Maybe<Scalars['Float']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  pollingInterval?: Maybe<Scalars['Float']['output']>;
  prompt?: Maybe<Scalars['String']['output']>;
  selector?: Maybe<Scalars['String']['output']>;
  selectorType?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  subjectFilter?: Maybe<Scalars['String']['output']>;
  temperature?: Maybe<Scalars['Float']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type NodeDataInput = {
  attribute?: InputMaybe<Scalars['String']['input']>;
  attributes?: InputMaybe<Array<Scalars['String']['input']>>;
  body?: InputMaybe<Scalars['String']['input']>;
  fromFilter?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  maxTokens?: InputMaybe<Scalars['Float']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  pollingInterval?: InputMaybe<Scalars['Float']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  selector?: InputMaybe<Scalars['String']['input']>;
  selectorType?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  subjectFilter?: InputMaybe<Scalars['String']['input']>;
  temperature?: InputMaybe<Scalars['Float']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type NodeResult = {
  __typename?: 'NodeResult';
  nodeId: Scalars['String']['output'];
  results?: Maybe<Array<Scalars['String']['output']>>;
  status: Scalars['String']['output'];
};

export type PaginationConfig = {
  __typename?: 'PaginationConfig';
  maxPages?: Maybe<Scalars['Float']['output']>;
  selector: Scalars['String']['output'];
};

export type PaginationConfigInput = {
  maxPages?: InputMaybe<Scalars['Float']['input']>;
  selector: Scalars['String']['input'];
};

export type Position = {
  __typename?: 'Position';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type PositionInput = {
  x: Scalars['Float']['input'];
  y: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  health: Scalars['String']['output'];
  isWorkflowScheduled: Scalars['Boolean']['output'];
  scrapeUrl: ScrapingResult;
  workflow: Workflow;
  workflowExecutions: Array<WorkflowExecution>;
  workflowTags: Array<WorkflowTag>;
  workflowTemplates: Array<WorkflowTemplate>;
  workflows: Array<Workflow>;
};


export type QueryIsWorkflowScheduledArgs = {
  workflowId: Scalars['ID']['input'];
};


export type QueryScrapeUrlArgs = {
  outputTemplate?: InputMaybe<Scalars['String']['input']>;
  selectors: Array<SelectorConfigInput>;
  url: Scalars['String']['input'];
};


export type QueryWorkflowArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkflowExecutionsArgs = {
  workflowId: Scalars['ID']['input'];
};

export type SaveAsTemplateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  workflow_id: Scalars['ID']['input'];
};

export type ScrapingNode = {
  __typename?: 'ScrapingNode';
  execute: ScrapingResult;
  getData: ScrapingNodeData;
};

export type ScrapingNodeData = {
  __typename?: 'ScrapingNodeData';
  outputTemplate?: Maybe<Scalars['String']['output']>;
  pagination?: Maybe<PaginationConfig>;
  selectors: Array<SelectorConfig>;
  url: Scalars['String']['output'];
};

export type ScrapingNodeDataInput = {
  outputTemplate?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<PaginationConfigInput>;
  selectors: Array<SelectorConfigInput>;
  url: Scalars['String']['input'];
};

export type ScrapingResult = {
  __typename?: 'ScrapingResult';
  error?: Maybe<Scalars['String']['output']>;
  results: Array<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SelectorConfig = {
  __typename?: 'SelectorConfig';
  attributes: Array<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  selector: Scalars['String']['output'];
  selectorType: Scalars['String']['output'];
};

export type SelectorConfigInput = {
  attributes: Array<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  selector: Scalars['String']['input'];
  selectorType: Scalars['String']['input'];
};

export type UpdateWorkflowInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  edges?: InputMaybe<Array<WorkflowEdgeInput>>;
  id: Scalars['ID']['input'];
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nodes?: InputMaybe<Array<WorkflowNodeInput>>;
  tag_ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Workflow = {
  __typename?: 'Workflow';
  created_at: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  edges: Array<WorkflowEdge>;
  id: Scalars['ID']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  nodes: Array<WorkflowNode>;
  tags?: Maybe<Array<WorkflowTag>>;
  updated_at: Scalars['DateTimeISO']['output'];
  user_id: Scalars['String']['output'];
};

export type WorkflowEdge = {
  __typename?: 'WorkflowEdge';
  id: Scalars['String']['output'];
  source: Scalars['String']['output'];
  sourceHandle?: Maybe<Scalars['String']['output']>;
  target: Scalars['String']['output'];
  targetHandle?: Maybe<Scalars['String']['output']>;
};

export type WorkflowEdgeInput = {
  id: Scalars['String']['input'];
  source: Scalars['String']['input'];
  sourceHandle?: InputMaybe<Scalars['String']['input']>;
  target: Scalars['String']['input'];
  targetHandle?: InputMaybe<Scalars['String']['input']>;
};

export type WorkflowExecution = {
  __typename?: 'WorkflowExecution';
  created_at: Scalars['DateTimeISO']['output'];
  execution_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  results?: Maybe<Array<NodeResult>>;
  status: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
  workflow_id: Scalars['ID']['output'];
};

export type WorkflowNode = {
  __typename?: 'WorkflowNode';
  data?: Maybe<NodeData>;
  id: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
  position: Position;
  type: Scalars['String']['output'];
};

export type WorkflowNodeInput = {
  data?: InputMaybe<NodeDataInput>;
  dragging?: InputMaybe<Scalars['Boolean']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  position: PositionInput;
  positionAbsolute?: InputMaybe<PositionInput>;
  selected?: InputMaybe<Scalars['Boolean']['input']>;
  type: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Float']['input']>;
};

export type WorkflowTag = {
  __typename?: 'WorkflowTag';
  color: Scalars['String']['output'];
  created_at: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['DateTimeISO']['output'];
};

export type WorkflowTemplate = {
  __typename?: 'WorkflowTemplate';
  created_at: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  edges: Array<WorkflowEdge>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nodes: Array<WorkflowNode>;
  updated_at: Scalars['DateTimeISO']['output'];
};

export type WorkflowNodeDataFieldsFragment = { __typename?: 'NodeData', label?: string | null, pollingInterval?: number | null, fromFilter?: string | null, subjectFilter?: string | null, to?: string | null, subject?: string | null, body?: string | null, url?: string | null, selector?: string | null, selectorType?: string | null, attributes?: Array<string> | null, template?: string | null, prompt?: string | null, model?: string | null, temperature?: number | null, maxTokens?: number | null } & { ' $fragmentName'?: 'WorkflowNodeDataFieldsFragment' };

export type WorkflowNodeFieldsFragment = { __typename?: 'WorkflowNode', id: string, type: string, label?: string | null, position: { __typename?: 'Position', x: number, y: number }, data?: (
    { __typename?: 'NodeData' }
    & { ' $fragmentRefs'?: { 'WorkflowNodeDataFieldsFragment': WorkflowNodeDataFieldsFragment } }
  ) | null } & { ' $fragmentName'?: 'WorkflowNodeFieldsFragment' };

export type WorkflowEdgeFieldsFragment = { __typename?: 'WorkflowEdge', id: string, source: string, target: string, sourceHandle?: string | null, targetHandle?: string | null } & { ' $fragmentName'?: 'WorkflowEdgeFieldsFragment' };

export type WorkflowTagFieldsFragment = { __typename?: 'WorkflowTag', id: string, name: string, color: string, created_at: string, updated_at: string } & { ' $fragmentName'?: 'WorkflowTagFieldsFragment' };

export type WorkflowFieldsFragment = { __typename?: 'Workflow', id: string, name: string, description?: string | null, is_active: boolean, created_at: string, updated_at: string, nodes: Array<(
    { __typename?: 'WorkflowNode' }
    & { ' $fragmentRefs'?: { 'WorkflowNodeFieldsFragment': WorkflowNodeFieldsFragment } }
  )>, edges: Array<(
    { __typename?: 'WorkflowEdge' }
    & { ' $fragmentRefs'?: { 'WorkflowEdgeFieldsFragment': WorkflowEdgeFieldsFragment } }
  )>, tags?: Array<(
    { __typename?: 'WorkflowTag' }
    & { ' $fragmentRefs'?: { 'WorkflowTagFieldsFragment': WorkflowTagFieldsFragment } }
  )> | null } & { ' $fragmentName'?: 'WorkflowFieldsFragment' };

export type CreateWorkflowMutationVariables = Exact<{
  input: CreateWorkflowInput;
}>;


export type CreateWorkflowMutation = { __typename?: 'Mutation', createWorkflow: (
    { __typename?: 'Workflow' }
    & { ' $fragmentRefs'?: { 'WorkflowFieldsFragment': WorkflowFieldsFragment } }
  ) };

export type ExecuteWorkflowMutationVariables = Exact<{
  workflowId: Scalars['String']['input'];
}>;


export type ExecuteWorkflowMutation = { __typename?: 'Mutation', executeWorkflow: { __typename?: 'ExecutionResult', success: boolean, message: string, executionId?: string | null, results?: Array<{ __typename?: 'NodeResult', nodeId: string, status: string, results?: Array<string> | null }> | null } };

export type UpdateWorkflowMutationVariables = Exact<{
  input: UpdateWorkflowInput;
}>;


export type UpdateWorkflowMutation = { __typename?: 'Mutation', updateWorkflow: (
    { __typename?: 'Workflow' }
    & { ' $fragmentRefs'?: { 'WorkflowFieldsFragment': WorkflowFieldsFragment } }
  ) };

export type StartTimedWorkflowMutationVariables = Exact<{
  workflowId: Scalars['String']['input'];
  nodes: Array<WorkflowNodeInput> | WorkflowNodeInput;
  edges: Array<WorkflowEdgeInput> | WorkflowEdgeInput;
  intervalMinutes: Scalars['Int']['input'];
}>;


export type StartTimedWorkflowMutation = { __typename?: 'Mutation', startTimedWorkflow: boolean };

export type StopTimedWorkflowMutationVariables = Exact<{
  workflowId: Scalars['String']['input'];
}>;


export type StopTimedWorkflowMutation = { __typename?: 'Mutation', stopTimedWorkflow: boolean };

export type DeleteWorkflowMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWorkflowMutation = { __typename?: 'Mutation', deleteWorkflow: boolean };

export type DuplicateWorkflowMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DuplicateWorkflowMutation = { __typename?: 'Mutation', duplicateWorkflow: (
    { __typename?: 'Workflow' }
    & { ' $fragmentRefs'?: { 'WorkflowFieldsFragment': WorkflowFieldsFragment } }
  ) };

export type CreateWorkflowTagMutationVariables = Exact<{
  input: CreateWorkflowTagInput;
}>;


export type CreateWorkflowTagMutation = { __typename?: 'Mutation', createWorkflowTag: (
    { __typename?: 'WorkflowTag' }
    & { ' $fragmentRefs'?: { 'WorkflowTagFieldsFragment': WorkflowTagFieldsFragment } }
  ) };

export type DeleteWorkflowTagMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWorkflowTagMutation = { __typename?: 'Mutation', deleteWorkflowTag: boolean };

export type SaveWorkflowAsTemplateMutationVariables = Exact<{
  input: SaveAsTemplateInput;
}>;


export type SaveWorkflowAsTemplateMutation = { __typename?: 'Mutation', saveWorkflowAsTemplate: { __typename?: 'WorkflowTemplate', id: string, name: string, description?: string | null, created_at: string, updated_at: string, nodes: Array<(
      { __typename?: 'WorkflowNode' }
      & { ' $fragmentRefs'?: { 'WorkflowNodeFieldsFragment': WorkflowNodeFieldsFragment } }
    )>, edges: Array<(
      { __typename?: 'WorkflowEdge' }
      & { ' $fragmentRefs'?: { 'WorkflowEdgeFieldsFragment': WorkflowEdgeFieldsFragment } }
    )> } };

export type DeleteWorkflowTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWorkflowTemplateMutation = { __typename?: 'Mutation', deleteWorkflowTemplate: boolean };

export type GetWorkflowsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkflowsQuery = { __typename?: 'Query', workflows: Array<(
    { __typename?: 'Workflow' }
    & { ' $fragmentRefs'?: { 'WorkflowFieldsFragment': WorkflowFieldsFragment } }
  )> };

export type GetWorkflowQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWorkflowQuery = { __typename?: 'Query', workflow: (
    { __typename?: 'Workflow' }
    & { ' $fragmentRefs'?: { 'WorkflowFieldsFragment': WorkflowFieldsFragment } }
  ) };

export type GetWorkflowTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkflowTemplatesQuery = { __typename?: 'Query', workflowTemplates: Array<{ __typename?: 'WorkflowTemplate', id: string, name: string, description?: string | null, created_at: string, updated_at: string, nodes: Array<(
      { __typename?: 'WorkflowNode' }
      & { ' $fragmentRefs'?: { 'WorkflowNodeFieldsFragment': WorkflowNodeFieldsFragment } }
    )>, edges: Array<(
      { __typename?: 'WorkflowEdge' }
      & { ' $fragmentRefs'?: { 'WorkflowEdgeFieldsFragment': WorkflowEdgeFieldsFragment } }
    )> }> };

export type GetWorkflowTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkflowTagsQuery = { __typename?: 'Query', workflowTags: Array<(
    { __typename?: 'WorkflowTag' }
    & { ' $fragmentRefs'?: { 'WorkflowTagFieldsFragment': WorkflowTagFieldsFragment } }
  )> };

export type GetWorkflowExecutionsQueryVariables = Exact<{
  workflowId: Scalars['ID']['input'];
}>;


export type GetWorkflowExecutionsQuery = { __typename?: 'Query', workflowExecutions: Array<{ __typename?: 'WorkflowExecution', id: string, workflow_id: string, execution_id: string, status: string, created_at: string, results?: Array<{ __typename?: 'NodeResult', nodeId: string, status: string, results?: Array<string> | null }> | null }> };

export type IsWorkflowScheduledQueryVariables = Exact<{
  workflowId: Scalars['ID']['input'];
}>;


export type IsWorkflowScheduledQuery = { __typename?: 'Query', isWorkflowScheduled: boolean };

export type TestQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TestQueryQuery = { __typename?: 'Query', workflows: Array<{ __typename?: 'Workflow', id: string, name: string, description?: string | null }> };

export const WorkflowNodeDataFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}}]} as unknown as DocumentNode<WorkflowNodeDataFieldsFragment, unknown>;
export const WorkflowNodeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}}]} as unknown as DocumentNode<WorkflowNodeFieldsFragment, unknown>;
export const WorkflowEdgeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}}]} as unknown as DocumentNode<WorkflowEdgeFieldsFragment, unknown>;
export const WorkflowTagFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<WorkflowTagFieldsFragment, unknown>;
export const WorkflowFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workflow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<WorkflowFieldsFragment, unknown>;
export const CreateWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkflowInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workflow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}}]} as unknown as DocumentNode<CreateWorkflowMutation, CreateWorkflowMutationVariables>;
export const ExecuteWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExecuteWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"executionId"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"results"}}]}}]}}]}}]} as unknown as DocumentNode<ExecuteWorkflowMutation, ExecuteWorkflowMutationVariables>;
export const UpdateWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWorkflowInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workflow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}}]} as unknown as DocumentNode<UpdateWorkflowMutation, UpdateWorkflowMutationVariables>;
export const StartTimedWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartTimedWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nodes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNodeInput"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"edges"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdgeInput"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"intervalMinutes"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTimedWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}},{"kind":"Argument","name":{"kind":"Name","value":"nodes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nodes"}}},{"kind":"Argument","name":{"kind":"Name","value":"edges"},"value":{"kind":"Variable","name":{"kind":"Name","value":"edges"}}},{"kind":"Argument","name":{"kind":"Name","value":"intervalMinutes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"intervalMinutes"}}}]}]}}]} as unknown as DocumentNode<StartTimedWorkflowMutation, StartTimedWorkflowMutationVariables>;
export const StopTimedWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopTimedWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopTimedWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}}]}]}}]} as unknown as DocumentNode<StopTimedWorkflowMutation, StopTimedWorkflowMutationVariables>;
export const DeleteWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkflowMutation, DeleteWorkflowMutationVariables>;
export const DuplicateWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DuplicateWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"duplicateWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workflow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}}]} as unknown as DocumentNode<DuplicateWorkflowMutation, DuplicateWorkflowMutationVariables>;
export const CreateWorkflowTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkflowTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkflowTagInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkflowTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<CreateWorkflowTagMutation, CreateWorkflowTagMutationVariables>;
export const DeleteWorkflowTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkflowTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkflowTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkflowTagMutation, DeleteWorkflowTagMutationVariables>;
export const SaveWorkflowAsTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveWorkflowAsTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveAsTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveWorkflowAsTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}}]} as unknown as DocumentNode<SaveWorkflowAsTemplateMutation, SaveWorkflowAsTemplateMutationVariables>;
export const DeleteWorkflowTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkflowTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkflowTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkflowTemplateMutation, DeleteWorkflowTemplateMutationVariables>;
export const GetWorkflowsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkflows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workflow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}}]} as unknown as DocumentNode<GetWorkflowsQuery, GetWorkflowsQueryVariables>;
export const GetWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workflow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}}]} as unknown as DocumentNode<GetWorkflowQuery, GetWorkflowQueryVariables>;
export const GetWorkflowTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkflowTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowEdgeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NodeData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"pollingInterval"}},{"kind":"Field","name":{"kind":"Name","value":"fromFilter"}},{"kind":"Field","name":{"kind":"Name","value":"subjectFilter"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selector"}},{"kind":"Field","name":{"kind":"Name","value":"selectorType"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokens"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowNodeDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowEdgeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowEdge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"sourceHandle"}},{"kind":"Field","name":{"kind":"Name","value":"targetHandle"}}]}}]} as unknown as DocumentNode<GetWorkflowTemplatesQuery, GetWorkflowTemplatesQueryVariables>;
export const GetWorkflowTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkflowTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowTagFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowTagFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<GetWorkflowTagsQuery, GetWorkflowTagsQueryVariables>;
export const GetWorkflowExecutionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkflowExecutions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowExecutions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workflow_id"}},{"kind":"Field","name":{"kind":"Name","value":"execution_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"results"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<GetWorkflowExecutionsQuery, GetWorkflowExecutionsQueryVariables>;
export const IsWorkflowScheduledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IsWorkflowScheduled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isWorkflowScheduled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}}]}]}}]} as unknown as DocumentNode<IsWorkflowScheduledQuery, IsWorkflowScheduledQueryVariables>;
export const TestQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<TestQueryQuery, TestQueryQueryVariables>;