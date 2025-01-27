import { Field, ID, InputType, Float } from 'type-graphql';
import { ScrapingNodeDataInput, SelectorConfigInput, BatchConfigInput } from './workflow';

@InputType()
export class PositionInput {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@InputType()
export class NodeDataInput {
  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => [String], { nullable: true })
  urls?: string[];

  @Field(() => [SelectorConfigInput], { nullable: true })
  selectors?: SelectorConfigInput[];

  @Field(() => BatchConfigInput, { nullable: true })
  batchConfig?: BatchConfigInput;

  @Field(() => String, { nullable: true })
  template?: string;

  // Gmail fields
  @Field(() => String, { nullable: true })
  to?: string;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => String, { nullable: true })
  body?: string;

  @Field(() => String, { nullable: true })
  subjectFilter?: string;

  @Field(() => String, { nullable: true })
  fromFilter?: string;

  @Field(() => Number, { nullable: true })
  pollingInterval?: number;

  // OpenAI fields
  @Field(() => String, { nullable: true })
  prompt?: string;

  @Field(() => String, { nullable: true })
  model?: string;

  @Field(() => Number, { nullable: true })
  temperature?: number;

  @Field(() => Number, { nullable: true })
  maxTokens?: number;
}

@InputType()
export class WorkflowNodeInput {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => PositionInput)
  position!: PositionInput;

  @Field(() => NodeDataInput, { nullable: true })
  data?: NodeDataInput;

  @Field(() => Float, { nullable: true })
  width?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Boolean, { nullable: true })
  selected?: boolean;

  @Field(() => PositionInput, { nullable: true })
  positionAbsolute?: PositionInput;

  @Field(() => Boolean, { nullable: true })
  dragging?: boolean;
}

@InputType()
export class WorkflowEdgeInput {
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

@InputType()
export class CreateWorkflowInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [WorkflowNodeInput])
  nodes!: WorkflowNodeInput[];

  @Field(() => [WorkflowEdgeInput])
  edges!: WorkflowEdgeInput[];

  @Field(() => [String], { nullable: true })
  tag_ids?: string[];
}

@InputType()
export class UpdateWorkflowInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [WorkflowNodeInput], { nullable: true })
  nodes?: WorkflowNodeInput[];

  @Field(() => [WorkflowEdgeInput], { nullable: true })
  edges?: WorkflowEdgeInput[];

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean;

  @Field(() => [String], { nullable: true })
  tag_ids?: string[];
}

@InputType()
export class CreateWorkflowTagInput {
  @Field()
  name!: string;

  @Field()
  color!: string;
}

@InputType()
export class SaveAsTemplateInput {
  @Field(() => ID)
  workflow_id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
} 
