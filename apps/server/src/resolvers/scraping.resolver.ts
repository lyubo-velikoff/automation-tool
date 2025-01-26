import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { ScrapingService } from '../integrations/scraping/service';
import { ScrapingNode, ScrapingNodeData, SelectorConfig, ScrapingResult } from '../integrations/scraping/nodes/ScrapingNode';
import { Context } from '../types/context';

@Resolver()
export class ScrapingResolver {
  private scrapingService: ScrapingService;

  constructor() {
    this.scrapingService = new ScrapingService();
  }

  @Query(() => ScrapingResult)
  async scrapeUrl(
    @Arg('url') url: string,
    @Arg('selectors', () => [SelectorConfig]) selectors: SelectorConfig[],
    @Arg('outputTemplate', { nullable: true }) outputTemplate?: string
  ): Promise<ScrapingResult> {
    try {
      console.log('Scraping URL:', url);
      console.log('Selectors:', JSON.stringify(selectors, null, 2));
      console.log('Output Template:', outputTemplate);

      const allResults = [];
      
      for (const selector of selectors) {
        console.log('Processing selector:', selector);
        const results = await this.scrapingService.scrapeUrl(
          url,
          selector.selector,
          selector.selectorType,
          selector.attributes
        );
        console.log('Results for selector:', results);
        allResults.push(...results);
      }

      // Format results if template is provided
      const formattedResults = outputTemplate 
        ? this.scrapingService.formatResults(allResults, outputTemplate)
        : allResults.map(r => JSON.stringify(r));

      console.log('Final formatted results:', formattedResults);

      return {
        success: true,
        results: formattedResults
      };
    } catch (error) {
      console.error('Failed to scrape URL:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  @Mutation(() => ScrapingNode)
  async createScrapingNode(
    @Arg('data') data: ScrapingNodeData,
    @Ctx() ctx: Context
  ): Promise<ScrapingNode> {
    if (!ctx.user) {
      throw new Error('Authentication required');
    }

    return new ScrapingNode(ctx.user.id, data);
  }
} 
