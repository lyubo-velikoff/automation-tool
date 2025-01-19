import { Field, ObjectType } from 'type-graphql';
import { ScrapingService } from '../service';

@ObjectType()
export class ScrapingNodeData {
  @Field()
  url!: string;

  @Field()
  selector!: string;

  @Field()
  selectorType!: 'css' | 'xpath';

  @Field()
  attribute!: string;
}

@ObjectType()
export class ScrapingResult {
  @Field()
  success!: boolean;

  @Field(() => [String])
  results!: string[];
}

export class ScrapingNode {
  private service: ScrapingService;
  private config: ScrapingNodeData;

  constructor(userId: string, config: ScrapingNodeData) {
    this.service = new ScrapingService();
    this.config = config;
  }

  async execute(context: Record<string, any>): Promise<ScrapingResult> {
    try {
      const results = await this.service.scrapeUrl(
        this.config.url,
        this.config.selector,
        this.config.selectorType,
        this.config.attribute
      );

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Failed to execute scraping node:', error);
      return {
        success: false,
        results: []
      };
    }
  }
} 
