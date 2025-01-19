import { ObjectType, Field, Float } from 'type-graphql';

@ObjectType()
export class Position {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@ObjectType()
export class WorkflowNode {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field()
  label!: string;

  @Field(() => Position)
  position!: Position;

  @Field(() => String, { nullable: true })
  data?: Record<string, any>;
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
