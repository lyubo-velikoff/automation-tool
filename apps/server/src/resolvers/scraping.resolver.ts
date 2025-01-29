import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { ScrapingService } from '../services/scraping.service';
import { ScrapingNode } from '../integrations/scraping/nodes/ScrapingNode';
import { Context } from '../types/context';
import { 
  BatchConfigInput, 
  SelectorConfigInput, 
  ScrapingNodeDataInput,
  ScrapingResultType 
} from '../schema/workflow';

@Resolver()
export class ScrapingResolver {
  private scrapingService: ScrapingService;

  constructor() {
    this.scrapingService = new ScrapingService();
  }

  @Query(() => ScrapingResultType)
  async scrapeUrl(
    @Arg('url') url: string,
    @Arg('selectors', () => [SelectorConfigInput]) selectors: SelectorConfigInput[],
    @Arg('outputTemplate', { nullable: true }) outputTemplate?: string
  ): Promise<ScrapingResultType> {
    try {
      console.log('Starting scrapeUrl query with:', {
        url,
        selectors: JSON.stringify(selectors, null, 2),
        outputTemplate
      });

      const allResults = [];
      
      for (const selector of selectors) {
        console.log('Processing selector:', selector);
        const results = await this.scrapingService.scrapeUrl(
          url,
          selector.selector,
          selector.selectorType,
          selector.attributes
        );
        console.log('Raw results:', JSON.stringify(results, null, 2));
        allResults.push(...results);
      }

      console.log('All raw results:', JSON.stringify(allResults, null, 2));

      // Format results if template is provided
      const formattedResults = outputTemplate 
        ? this.scrapingService.formatResults(allResults, outputTemplate)
        : allResults.map(r => JSON.stringify(r));

      console.log('Formatted results:', formattedResults);

      return new ScrapingResultType({
        success: true,
        results: formattedResults,
        data: allResults.length > 0 ? allResults[0] : undefined
      });
    } catch (error) {
      console.error('Failed to scrape URL:', error);
      return new ScrapingResultType({
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  @Mutation(() => ScrapingNode)
  async createScrapingNode(
    @Arg('data') data: ScrapingNodeDataInput,
    @Ctx() ctx: Context
  ): Promise<ScrapingNode> {
    if (!ctx.user) {
      throw new Error('Authentication required');
    }

    return new ScrapingNode(ctx.user.id, data);
  }
} 
