import { Field, ObjectType, InputType } from 'type-graphql';
import { ScrapingService } from '../../../services/scraping.service';
import { SelectorConfig, BatchConfig } from '../../../schema/workflow';

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
  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => [String], { nullable: true })
  urls?: string[];

  @Field(() => [SelectorConfig], { nullable: true })
  selectors?: SelectorConfig[];

  @Field(() => BatchConfig, { nullable: true })
  batchConfig?: BatchConfig;

  @Field({ nullable: true })
  template?: string;
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

  async execute(): Promise<ScrapingResult> {
    try {
      if (!this.config.url && !this.config.urls) {
        throw new Error('Either url or urls must be provided');
      }

      if (!this.config.selectors || this.config.selectors.length === 0) {
        throw new Error('At least one selector must be provided');
      }

      // Handle single URL case
      if (this.config.url) {
        const allResults = [];
        
        for (const selector of this.config.selectors) {
          const results = await this.service.scrapeUrl(
            this.config.url,
            selector.selector,
            selector.selectorType as 'css' | 'xpath',
            selector.attributes
          );
          allResults.push(...results);
        }

        // Format results if template is provided
        const formattedResults = this.config.template 
          ? this.service.formatResults(allResults, this.config.template)
          : allResults.map(r => JSON.stringify(r));

        return {
          success: true,
          results: formattedResults
        };
      }

      // Handle multiple URLs case
      if (this.config.urls && this.config.selectors[0]) {
        const selector = this.config.selectors[0];
        const results = await this.service.scrapeUrls(
          this.config.urls,
          selector.selector,
          selector.selectorType as 'css' | 'xpath',
          selector.attributes,
          this.config.batchConfig
        );

        // Format results if template is provided
        const formattedResults = this.config.template 
          ? this.service.formatBatchResults(results, this.config.template)
          : results.map(r => JSON.stringify(r));

        return {
          success: true,
          results: formattedResults
        };
      }

      throw new Error('Invalid configuration');
    } catch (error) {
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 
