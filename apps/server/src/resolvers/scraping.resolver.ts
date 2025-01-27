import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field } from 'type-graphql';
import { ScrapingService } from '../services/scraping.service';
import { ScrapingNode, ScrapingNodeData, ScrapingResult } from '../integrations/scraping/nodes/ScrapingNode';
import { Context } from '../types/context';
import { BatchConfigInput, SelectorConfigInput, ScrapingNodeDataInput } from '../schema/workflow';

@Resolver()
export class ScrapingResolver {
  private scrapingService: ScrapingService;

  constructor() {
    this.scrapingService = new ScrapingService();
  }

  @Query(() => ScrapingResult)
  async scrapeMultipleUrls(
    @Arg('urls', () => [String]) urls: string[],
    @Arg('selector', () => SelectorConfigInput) selector: SelectorConfigInput,
    @Arg('batchConfig', () => BatchConfigInput, { nullable: true }) batchConfig?: BatchConfigInput,
    @Arg('template', { nullable: true }) template?: string
  ): Promise<ScrapingResult> {
    try {
      console.log('Starting scrapeMultipleUrls query with:', {
        urls,
        selector: JSON.stringify(selector, null, 2),
        batchConfig,
        template
      });

      const results = await this.scrapingService.scrapeUrls(
        urls,
        selector.selector,
        selector.selectorType as 'css' | 'xpath',
        selector.attributes,
        batchConfig
      );

      console.log('Raw results:', JSON.stringify(results, null, 2));

      // Format results if template is provided
      const formattedResults = template 
        ? this.scrapingService.formatBatchResults(results, template)
        : results.map(r => JSON.stringify(r));

      console.log('Formatted results:', formattedResults);

      return {
        success: true,
        results: formattedResults
      };
    } catch (error) {
      console.error('Failed to scrape URLs:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  @Query(() => ScrapingResult)
  async scrapeUrl(
    @Arg('url') url: string,
    @Arg('selectors', () => [SelectorConfigInput]) selectors: SelectorConfigInput[],
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
          selector.selectorType as 'css' | 'xpath',
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
    @Arg('data') data: ScrapingNodeDataInput,
    @Ctx() ctx: Context
  ): Promise<ScrapingNode> {
    if (!ctx.user) {
      throw new Error('Authentication required');
    }

    return new ScrapingNode(ctx.user.id, data);
  }
} 
