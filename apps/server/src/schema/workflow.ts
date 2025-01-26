import { Field, ID, ObjectType, Float } from 'type-graphql';
import { NodeResult } from "../resolvers/workflow.resolver";
import { WorkflowNodeInput, WorkflowEdgeInput, CreateWorkflowInput, UpdateWorkflowInput } from './workflow-inputs';

@ObjectType()
export class Position {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@ObjectType()
export class NodeData {
  @Field(() => String, { nullable: true })
  label?: string;

  // Gmail fields
  @Field(() => String, { nullable: true })
  to?: string;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => String, { nullable: true })
  body?: string;

  @Field(() => String, { nullable: true })
  fromFilter?: string;

  @Field(() => String, { nullable: true })
  subjectFilter?: string;

  @Field(() => Number, { nullable: true })
  pollingInterval?: number;

  // Scraping fields
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  selector?: string;

  @Field(() => String, { nullable: true })
  selectorType?: string;

  @Field(() => String, { nullable: true })
  attribute?: string;

  @Field(() => [String], { nullable: true })
  attributes?: string[];

  @Field(() => String, { nullable: true })
  template?: string;
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
