import { Field, ID, ObjectType } from 'type-graphql';

export enum NodeType {
  GMAIL_TRIGGER = 'GMAIL_TRIGGER',
  GMAIL_ACTION = 'GMAIL_ACTION',
  SCRAPING = 'SCRAPING',
  OPENAI = 'OPENAI'
}

@ObjectType()
export class BaseNode {
  @Field(() => ID)
  id: string = '';

  @Field(() => String)
  type: NodeType = NodeType.SCRAPING;

  @Field(() => String)
  label: string = '';

  @Field(() => String, { nullable: true })
  description?: string;
} 
