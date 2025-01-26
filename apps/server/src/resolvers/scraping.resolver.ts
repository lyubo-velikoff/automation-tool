import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { ScrapingService } from '../services/scraping.service';
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
