import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class NodeData {
  @Field({ nullable: true })
  pollingInterval?: number;

  @Field({ nullable: true })
  fromFilter?: string;

  @Field({ nullable: true })
  subjectFilter?: string;

  @Field({ nullable: true })
  to?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  body?: string;

  @Field({ nullable: true })
  prompt?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  maxTokens?: number;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  selector?: string;

  @Field({ nullable: true })
  selectorType?: string;

  @Field({ nullable: true })
  attribute?: string;

  @Field({ nullable: true })
  label?: string;
}

@ObjectType()
export class Position {
  @Field()
  x!: number;

  @Field()
  y!: number;
}

@ObjectType()
export class Node {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field({ nullable: true })
  label?: string;

  @Field(() => Position)
  position!: Position;

  @Field(() => NodeData, { nullable: true })
  data?: NodeData;
}

@ObjectType()
export class Edge {
  @Field(() => ID)
  id!: string;

  @Field()
  source!: string;

  @Field()
  target!: string;

  @Field({ nullable: true })
  sourceHandle?: string;

  @Field({ nullable: true })
  targetHandle?: string;
} 
