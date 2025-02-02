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

export type ResultType = 'text' | 'url' | 'number' | 'html';
export type VariableType = 'selector' | 'raw' | 'wholeNode';

export interface NodeVariable {
  type: VariableType;
  format: ResultType;
  reference: string;  // e.g., "Cursor.Title[0]" or "Cursor.Title" or "Cursor"
}

export interface SelectorResult {
  value: string;
  type: ResultType;
  metadata?: {
    sourceUrl?: string;
    timestamp?: string;
    index?: number;
  };
}

export interface NodeResults {
  bySelector: {
    [selectorName: string]: SelectorResult[][];
  };
  raw: SelectorResult[][];
  wholeNode?: string;
}

export interface NodeConnection {
  sourceNodeId: string;
  targetNodeId: string;
  availableVariables: {
    node: string;
    selectors: {
      name: string;
      type: ResultType;
      hasResults: boolean;
    }[];
  };
}

// GraphQL Types
@ObjectType()
export class SelectorResultType {
  @Field()
  value!: string;

  @Field()
  type!: string;

  @Field(() => ResultMetadataType, { nullable: true })
  metadata?: ResultMetadataType;
}

@ObjectType()
class ResultMetadataType {
  @Field({ nullable: true })
  sourceUrl?: string;

  @Field({ nullable: true })
  timestamp?: string;

  @Field({ nullable: true })
  index?: number;
}

@ObjectType()
export class NodeResultsType {
  @Field(() => [[SelectorResultType]])
  raw!: SelectorResultType[][];

  @Field(() => String, { nullable: true })
  wholeNode?: string;

  @Field(() => [SelectorVariable])
  availableVariables!: SelectorVariable[];
}

@ObjectType()
class SelectorVariable {
  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  hasResults!: boolean;

  @Field(() => [[SelectorResultType]])
  results!: SelectorResultType[][];
} 
