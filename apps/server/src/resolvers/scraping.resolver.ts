import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { ScrapingService } from '../integrations/scraping/service';
import { ScrapingNode, ScrapingNodeData } from '../integrations/scraping/nodes/ScrapingNode';
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
    @Arg('attribute', () => String, { defaultValue: 'text' }) attribute: string,
    @Ctx() ctx?: Context
  ) {
    return this.scrapingService.scrapeUrl(url, selector, selectorType, attribute);
  }

  @Mutation(() => ScrapingNode)
  async createScrapingNode(
    @Arg('data') data: ScrapingNodeData,
    @Ctx() ctx: Context
  ) {
    if (!ctx.user) {
      throw new Error('Authentication required');
    }

    return new ScrapingNode(ctx.user.id, data);
  }
} 
