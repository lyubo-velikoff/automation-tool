import { Field, ObjectType, InputType } from 'type-graphql';
import { ScrapingService } from '../../../services/scraping.service';

@ObjectType()
@InputType('SelectorConfigInput')
export class SelectorConfig {
  @Field()
  selector!: string;

  @Field()
  selectorType!: 'css' | 'xpath';

  @Field(() => [String])
  attributes!: string[];

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
@InputType('PaginationConfigInput')
export class PaginationConfig {
  @Field()
  selector!: string;

  @Field({ nullable: true })
  maxPages?: number;
}

@ObjectType()
@InputType('ScrapingNodeDataInput')
export class ScrapingNodeData {
  @Field()
  url!: string;

  @Field(() => [SelectorConfig])
  selectors!: SelectorConfig[];

  @Field(() => PaginationConfig, { nullable: true })
  pagination?: PaginationConfig;

  @Field({ nullable: true })
  outputTemplate?: string;
}

@ObjectType()
export class ScrapingResult {
  @Field()
  success!: boolean;

  @Field(() => [String])
  results!: string[];

  @Field(() => String, { nullable: true })
  error?: string;
}

@ObjectType()
export class ScrapingNode {
  private service: ScrapingService;
  private config: ScrapingNodeData;

  constructor(userId: string, config: ScrapingNodeData) {
    this.service = new ScrapingService();
    this.config = config;
  }

  @Field(() => ScrapingNodeData)
  getData(): ScrapingNodeData {
    return this.config;
  }

  @Field(() => ScrapingResult)
  async execute(context: Record<string, any>): Promise<ScrapingResult> {
    try {
      const allResults = [];
      
      for (const selectorConfig of this.config.selectors) {
        const results = await this.service.scrapeUrl(
          this.config.url,
          selectorConfig.selector,
          selectorConfig.selectorType,
          selectorConfig.attributes
        );
        allResults.push(...results);
      }

      // Format results if template is provided
      const formattedResults = this.config.outputTemplate 
        ? this.service.formatResults(allResults, this.config.outputTemplate)
        : allResults.map(r => JSON.stringify(r));

      return {
        success: true,
        results: formattedResults
      };
    } catch (error) {
      console.error('Failed to execute scraping node:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 
