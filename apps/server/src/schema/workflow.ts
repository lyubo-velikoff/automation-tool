import { Field, ID, ObjectType, InputType, Float } from 'type-graphql';

@ObjectType()
@InputType("PositionInput")
export class Position {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@ObjectType()
export class NodePosition {
  @Field(() => Number)
  x!: number;

  @Field(() => Number)
  y!: number;
}

@InputType()
export class NodePositionInput {
  @Field(() => Number)
  x!: number;

  @Field(() => Number)
  y!: number;
}

@ObjectType()
export class GmailTriggerData {
  @Field(() => Number, { nullable: true })
  pollingInterval?: number;

  @Field(() => String, { nullable: true })
  fromFilter?: string;

  @Field(() => String, { nullable: true })
  subjectFilter?: string;
}

@ObjectType()
export class GmailActionData {
  @Field(() => String, { nullable: true })
  to?: string;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => String, { nullable: true })
  body?: string;
}

@InputType()
export class GmailTriggerDataInput {
  @Field(() => Number, { nullable: true })
  pollingInterval?: number;

  @Field(() => String, { nullable: true })
  fromFilter?: string;

  @Field(() => String, { nullable: true })
  subjectFilter?: string;
}

@InputType()
export class GmailActionDataInput {
  @Field(() => String, { nullable: true })
  to?: string;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => String, { nullable: true })
  body?: string;
}

@ObjectType()
@InputType("NodeDataInput")
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

  @Field(() => String, { nullable: true })
  pollingInterval?: string;

  // OpenAI fields
  @Field(() => String, { nullable: true })
  prompt?: string;

  @Field(() => String, { nullable: true })
  model?: string;

  @Field(() => String, { nullable: true })
  maxTokens?: string;

  // Scraping fields
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  selector?: string;

  @Field(() => String, { nullable: true })
  selectorType?: string;

  @Field(() => String, { nullable: true })
  attribute?: string;
}

@InputType()
export class NodeDataInput {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  selector?: string;

  @Field(() => String, { nullable: true })
  selectorType?: 'css' | 'xpath';

  @Field(() => String, { nullable: true })
  attribute?: string;

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

  @Field(() => String, { nullable: true })
  pollingInterval?: string;

  // OpenAI fields
  @Field(() => String, { nullable: true })
  prompt?: string;

  @Field(() => String, { nullable: true })
  model?: string;

  @Field(() => String, { nullable: true })
  maxTokens?: string;
}

@ObjectType()
@InputType("WorkflowNodeInput")
export class WorkflowNode {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field()
  label!: string;

  @Field(() => Position)
  position!: Position;

  @Field(() => NodeData, { nullable: true })
  data?: NodeData;
}

@ObjectType()
@InputType("WorkflowEdgeInput")
export class WorkflowEdge {
  @Field()
  id!: string;

  @Field()
  source!: string;

  @Field()
  target!: string;
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
  created_at!: Date;

  @Field()
  updated_at!: Date;

  @Field()
  user_id!: string;

  @Field()
  is_active!: boolean;

  constructor(data?: Partial<Workflow>) {
    if (data) {
      Object.assign(this, {
        ...data,
        created_at: data.created_at ? new Date(data.created_at) : undefined,
        updated_at: data.updated_at ? new Date(data.updated_at) : undefined
      });
    }
  }
}

@InputType()
export class CreateWorkflowInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [WorkflowNode])
  nodes!: WorkflowNode[];

  @Field(() => [WorkflowEdge])
  edges!: WorkflowEdge[];
}

@InputType()
export class UpdateWorkflowInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [WorkflowNode], { nullable: true })
  nodes?: WorkflowNode[];

  @Field(() => [WorkflowEdge], { nullable: true })
  edges?: WorkflowEdge[];
} 
