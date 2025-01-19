import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ScrapingNode, ScrapingNodeData } from '../integrations/scraping/nodes/ScrapingNode';
import { ScrapingService } from '../integrations/scraping/service';
import { Context } from '../types/context';

@Resolver()
export class ScrapingResolver {
  private scrapingService: ScrapingService;

  constructor() {
    this.scrapingService = new ScrapingService();
  }

  @Query(() => [String])
  async scrapeUrl(
    @Arg('url') url: string,
    @Arg('selector') selector: string,
    @Arg('selectorType', () => String) selectorType: 'css' | 'xpath',
    @Arg('attribute', { nullable: true }) attribute?: string,
    @Ctx() ctx?: Context
  ): Promise<string[]> {
    return this.scrapingService.scrapeUrl(url, selector, selectorType, attribute, ctx?.user?.id);
  }

  @Mutation(() => ScrapingNode)
  async createScrapingNode(
    @Arg('data') data: ScrapingNodeData,
    @Ctx() ctx: Context
  ): Promise<ScrapingNode> {
    // Validate URL
    try {
      new URL(data.url);
    } catch (error) {
      throw new Error('Invalid URL provided');
    }

    return new ScrapingNode(data);
  }
} 
