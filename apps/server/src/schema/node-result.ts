import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class NodeResult {
  constructor(nodeId: string, status: string, results?: string[]) {
    this.nodeId = nodeId;
    this.status = status;
    this.results = results;
  }

  @Field(() => String)
  nodeId!: string;

  @Field(() => String)
  status!: string;

  @Field(() => [String], { nullable: true })
  results?: string[];
} 
