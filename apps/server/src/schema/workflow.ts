import { Field, ID, ObjectType, InputType } from 'type-graphql';

@ObjectType()
export class WorkflowNode {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field(() => String)
  label!: string;

  @Field(() => Number)
  x!: number;

  @Field(() => Number)
  y!: number;

  constructor(data: Partial<WorkflowNode> = {}) {
    Object.assign(this, data);
  }
}

@ObjectType()
export class WorkflowEdge {
  @Field()
  id!: string;

  @Field()
  source!: string;

  @Field()
  target!: string;

  constructor(data: Partial<WorkflowEdge> = {}) {
    Object.assign(this, data);
  }
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

  constructor(data: Partial<Workflow> = {}) {
    Object.assign(this, data);
  }
}

@InputType()
export class WorkflowNodeInput {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field(() => String)
  label!: string;

  @Field(() => Number)
  x!: number;

  @Field(() => Number)
  y!: number;

  constructor(data: Partial<WorkflowNodeInput> = {}) {
    Object.assign(this, data);
  }
}

@InputType()
export class WorkflowEdgeInput {
  @Field()
  id!: string;

  @Field()
  source!: string;

  @Field()
  target!: string;

  constructor(data: Partial<WorkflowEdgeInput> = {}) {
    Object.assign(this, data);
  }
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

  constructor(data: Partial<CreateWorkflowInput> = {}) {
    Object.assign(this, data);
  }
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

  constructor(data: Partial<UpdateWorkflowInput> = {}) {
    Object.assign(this, data);
  }
} 
