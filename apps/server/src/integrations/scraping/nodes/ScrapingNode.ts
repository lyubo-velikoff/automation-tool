import { Field, ObjectType } from 'type-graphql';
import { BaseNode, NodeType } from '../../../types/nodes';

@ObjectType()
export class ScrapingNodeData {
  @Field()
  url: string = '';

  @Field()
  selector: string = '';

  @Field()
  selectorType: 'css' | 'xpath' = 'css';

  @Field({ nullable: true })
  attribute?: string;
}

@ObjectType()
export class ScrapingNode extends BaseNode {
  static type = NodeType.SCRAPING;
  
  @Field(() => ScrapingNodeData)
  data: ScrapingNodeData;

  constructor(data: ScrapingNodeData) {
    super();
    this.type = NodeType.SCRAPING;
    this.data = data;
    this.id = `scraping-${Date.now()}`;
    this.label = 'Web Scraping';
  }
} 
