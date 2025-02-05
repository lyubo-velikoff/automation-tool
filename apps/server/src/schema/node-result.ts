import { ObjectType, Field, ID } from "type-graphql";
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class NodeResult {
  @Field(() => ID)
  nodeId: string;

  @Field()
  status: string;

  @Field(() => [GraphQLJSONObject])
  results: any[];

  @Field(() => String, { nullable: true })
  nodeName?: string;

  constructor(nodeId: string, status: string, results: any[], nodeName?: string) {
    this.nodeId = nodeId;
    this.status = status;
    this.results = results;
    this.nodeName = nodeName;
  }
} 
