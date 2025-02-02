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
  DateTimeISO: { input: any; output: any; }
};

export type BatchConfigInput = {
  batchSize: Scalars['Float']['input'];
  rateLimit: Scalars['Float']['input'];
};

export type BatchConfigType = {
  batchSize: Scalars['Float']['output'];
  rateLimit: Scalars['Float']['output'];
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
  executionId?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  results?: Maybe<Array<NodeResult>>;
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
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
  testScraping: ScrapingResult;
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


export type MutationTestScrapingArgs = {
  selectors: Array<SelectorConfigInput>;
  url: Scalars['String']['input'];
};


export type MutationUpdateWorkflowArgs = {
  input: UpdateWorkflowInput;
};

export type NodeData = {
  batchConfig?: Maybe<BatchConfigType>;
  body?: Maybe<Scalars['String']['output']>;
  fromFilter?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  maxTokens?: Maybe<Scalars['Int']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  pollingInterval?: Maybe<Scalars['Int']['output']>;
  prompt?: Maybe<Scalars['String']['output']>;
  selectors?: Maybe<Array<SelectorConfigType>>;
  subject?: Maybe<Scalars['String']['output']>;
  subjectFilter?: Maybe<Scalars['String']['output']>;
  temperature?: Maybe<Scalars['Float']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type NodeDataInput = {
  batchConfig?: InputMaybe<BatchConfigInput>;
  body?: InputMaybe<Scalars['String']['input']>;
  fromFilter?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  maxTokens?: InputMaybe<Scalars['Float']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  pollingInterval?: InputMaybe<Scalars['Float']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  selectors?: InputMaybe<Array<SelectorConfigInput>>;
  subject?: InputMaybe<Scalars['String']['input']>;
  subjectFilter?: InputMaybe<Scalars['String']['input']>;
  temperature?: InputMaybe<Scalars['Float']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type NodeResult = {
  nodeId: Scalars['String']['output'];
  results?: Maybe<Array<Scalars['String']['output']>>;
  status: Scalars['String']['output'];
};

export type PositionInput = {
  x: Scalars['Float']['input'];
  y: Scalars['Float']['input'];
};

export type PositionType = {
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type Query = {
  health: Scalars['String']['output'];
  isWorkflowScheduled: Scalars['Boolean']['output'];
  scrapeUrl: ScrapingResultType;
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

export type ScrapingDataType = {
  keys: Array<Scalars['String']['output']>;
  values: Array<Scalars['String']['output']>;
};

export type ScrapingNode = {
  getData: ScrapingNodeDataType;
};

export type ScrapingNodeDataInput = {
  batchConfig?: InputMaybe<BatchConfigInput>;
  label?: InputMaybe<Scalars['String']['input']>;
  selectors?: InputMaybe<Array<SelectorConfigInput>>;
  template?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ScrapingNodeDataType = {
  batchConfig?: Maybe<BatchConfigType>;
  label?: Maybe<Scalars['String']['output']>;
  selectors?: Maybe<Array<SelectorConfigType>>;
  template?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapingResult = {
  error?: Maybe<Scalars['String']['output']>;
  results: Array<Array<Scalars['String']['output']>>;
  success: Scalars['Boolean']['output'];
};

export type ScrapingResultType = {
  data?: Maybe<ScrapingDataType>;
  error?: Maybe<Scalars['String']['output']>;
  results: Array<Scalars['String']['output']>;
  scrapedData?: Maybe<ScrapingDataType>;
  success: Scalars['Boolean']['output'];
};

export type SelectorConfigInput = {
  attributes: Array<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  selector: Scalars['String']['input'];
  selectorType: Scalars['String']['input'];
};

export type SelectorConfigType = {
  attributes: Array<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  selector: Scalars['String']['output'];
  selectorType: Scalars['String']['output'];
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
  created_at: Scalars['DateTimeISO']['output'];
  execution_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  results?: Maybe<Array<NodeResult>>;
  status: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
  workflow_id: Scalars['ID']['output'];
};

export type WorkflowNode = {
  data?: Maybe<NodeData>;
  id: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
  position: PositionType;
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
  color: Scalars['String']['output'];
  created_at: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['DateTimeISO']['output'];
};

export type WorkflowTemplate = {
  created_at: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  edges: Array<WorkflowEdge>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nodes: Array<WorkflowNode>;
  updated_at: Scalars['DateTimeISO']['output'];
};
