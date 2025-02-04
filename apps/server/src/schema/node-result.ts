import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class NodeResult {
  constructor(nodeId: string, status: string, results?: string[], nodeName?: string) {
    this.nodeId = nodeId;
    this.status = status;
    this.results = results;
    this.nodeName = nodeName;
  }

  @Field(() => String)
  nodeId!: string;

  @Field(() => String)
  status!: string;

  @Field(() => [String], { nullable: true })
  results?: string[];

  @Field(() => String, { nullable: true })
  nodeName?: string;
} 
