import { Field, ID, ObjectType, Float, Int, InputType } from 'type-graphql';
import { NodeResult } from "./node-result";
import { WorkflowNodeInput, WorkflowEdgeInput, CreateWorkflowInput, UpdateWorkflowInput } from './workflow-inputs';

@ObjectType()
export class Position {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@ObjectType()
export class BatchConfig {
  @Field()
  batchSize!: number;

  @Field()
  rateLimit!: number;
}

@InputType()
export class BatchConfigInput {
  @Field()
  batchSize!: number;

  @Field()
  rateLimit!: number;
}

@ObjectType()
export class SelectorConfig {
  @Field()
  selector!: string;

  @Field()
  selectorType!: string;

  @Field(() => [String])
  attributes!: string[];

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class SelectorConfigInput {
  @Field()
  selector!: string;

  @Field()
  selectorType!: string;

  @Field(() => [String])
  attributes!: string[];

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class ScrapingNodeDataInput {
  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => [String], { nullable: true })
  urls?: string[];

  @Field(() => [SelectorConfigInput], { nullable: true })
  selectors?: SelectorConfigInput[];

  @Field(() => BatchConfigInput, { nullable: true })
  batchConfig?: BatchConfigInput;

  @Field({ nullable: true })
  template?: string;
}

@ObjectType()
export class NodeData {
  @Field({ nullable: true })
  label?: string;

  // Gmail fields
  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  body?: string;

  @Field({ nullable: true })
  to?: string;

  // Scraping fields
  @Field({ nullable: true })
  url?: string;

  @Field(() => [String], { nullable: true })
  urls?: string[];

  @Field({ nullable: true })
  selector?: string;

  @Field({ nullable: true })
  selectorType?: string;

  @Field(() => [String], { nullable: true })
  attributes?: string[];

  @Field({ nullable: true })
  template?: string;

  // Multi-URL scraping fields
  @Field(() => [SelectorConfig], { nullable: true })
  selectors?: SelectorConfig[];

  @Field(() => BatchConfig, { nullable: true })
  batchConfig?: BatchConfig;

  // OpenAI fields
  @Field({ nullable: true })
  prompt?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Float, { nullable: true })
  temperature?: number;

  @Field(() => Int, { nullable: true })
  maxTokens?: number;

  // Common fields
  @Field({ nullable: true })
  fromFilter?: string;

  @Field({ nullable: true })
  subjectFilter?: string;

  @Field(() => Int, { nullable: true })
  pollingInterval?: number;

  @Field({ nullable: true })
  attribute?: string;
}

@ObjectType()
export class WorkflowNode {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Position)
  position!: Position;

  @Field(() => NodeData, { nullable: true })
  data?: NodeData;
}

@ObjectType()
export class WorkflowEdge {
  @Field()
  id!: string;

  @Field()
  source!: string;

  @Field()
  target!: string;

  @Field(() => String, { nullable: true })
  sourceHandle?: string | null;

  @Field(() => String, { nullable: true })
  targetHandle?: string | null;
}

@ObjectType()
export class WorkflowTag {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  color!: string;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class Workflow {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [WorkflowNode])
  nodes!: WorkflowNode[];

  @Field(() => [WorkflowEdge])
  edges!: WorkflowEdge[];

  @Field()
  is_active!: boolean;

  @Field(() => [WorkflowTag], { nullable: true })
  tags?: WorkflowTag[];

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;

  @Field()
  user_id!: string;
}

@ObjectType()
export class WorkflowExecution {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workflow_id!: string;

  @Field(() => ID)
  user_id!: string;

  @Field()
  execution_id!: string;

  @Field()
  status!: string;

  @Field(() => [NodeResult], { nullable: true })
  results?: NodeResult[];

  @Field()
  created_at!: Date;
} 
