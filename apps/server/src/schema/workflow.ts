import { Field, ID, ObjectType, InputType } from 'type-graphql';

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
export class NodeData {
  @Field(() => Number, { nullable: true })
  pollingInterval?: number;

  @Field(() => String, { nullable: true })
  fromFilter?: string;

  @Field(() => String, { nullable: true })
  subjectFilter?: string;
}

@InputType()
export class NodeDataInput {
  @Field(() => Number, { nullable: true })
  pollingInterval?: number;

  @Field(() => String, { nullable: true })
  fromFilter?: string;

  @Field(() => String, { nullable: true })
  subjectFilter?: string;
}

@ObjectType()
export class WorkflowNode {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field(() => String)
  label!: string;

  @Field(() => NodePosition)
  position!: NodePosition;

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
}

@InputType()
export class WorkflowNodeInput {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field(() => String)
  label!: string;

  @Field(() => NodePositionInput)
  position!: NodePositionInput;

  @Field(() => NodeDataInput, { nullable: true })
  data?: NodeDataInput;
}

@InputType()
export class WorkflowEdgeInput {
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

  @Field(() => [WorkflowNodeInput])
  nodes!: WorkflowNodeInput[];

  @Field(() => [WorkflowEdgeInput])
  edges!: WorkflowEdgeInput[];
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
} 
