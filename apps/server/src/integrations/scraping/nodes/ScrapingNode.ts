import { Field, ObjectType } from 'type-graphql';
import { ScrapingService } from '../../../services/scraping.service';
import { ScrapingNodeData, ScrapingResult } from '../../../types/scraping';
import { ScrapingNodeDataType, ScrapingResultType } from '../../../schema/workflow';

@ObjectType()
export class ScrapingNode {
  private service: ScrapingService;
  private config: ScrapingNodeData;

  constructor(userId: string, config: ScrapingNodeData) {
    this.service = new ScrapingService();
    this.config = config;
  }

  @Field(() => ScrapingNodeDataType)
  getData(): ScrapingNodeData {
    return this.config;
  }

  async execute(): Promise<ScrapingResultType> {
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
            selector.selectorType,
            selector.attributes
          );
          allResults.push(...results);
        }

        // Format results if template is provided
        const formattedResults = this.config.template 
          ? this.service.formatResults(allResults, this.config.template)
          : allResults.map(r => JSON.stringify(r));

        return new ScrapingResultType({
          success: true,
          results: formattedResults,
          data: allResults.length > 0 ? allResults[0] : undefined
        });
      }

      // Handle multiple URLs case
      if (this.config.urls && this.config.selectors[0]) {
        const selector = this.config.selectors[0];
        const results = await this.service.scrapeUrls(
          this.config.urls,
          selector,
          selector.selectorType,
          selector.attributes,
          this.config.batchConfig
        );

        // Format results if template is provided
        const formattedResults = this.config.template 
          ? this.service.formatBatchResults(results, this.config.template)
          : results.map(r => JSON.stringify(r));

        return new ScrapingResultType({
          success: true,
          results: formattedResults,
          data: results.length > 0 && results[0].data ? results[0].data : undefined
        });
      }

      throw new Error('Invalid configuration');
    } catch (error) {
      return new ScrapingResultType({
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
} 
