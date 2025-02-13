import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { ScrapingService } from "../services/scraping.service";
import { ScrapingNode } from "../integrations/scraping/nodes/ScrapingNode";
import { Context } from "../types/context";
import {
  SelectorConfigInput,
  ScrapingNodeDataInput,
  ScrapingResultType,
} from "../schema/workflow";
import { ScrapingResult } from "../schema/scraping";

@Resolver()
export class ScrapingResolver {
  private scrapingService: ScrapingService;

  constructor() {
    this.scrapingService = new ScrapingService();
  }

  @Query(() => ScrapingResultType)
  async scrapeUrl(
    @Arg("url") url: string,
    @Arg("selectors", () => [SelectorConfigInput])
    selectors: SelectorConfigInput[],
    @Arg("outputTemplate", { nullable: true }) outputTemplate?: string
  ): Promise<ScrapingResultType> {
    try {
      const allResults = [];

      for (const selector of selectors) {
        const results = await this.scrapingService.scrapeUrl(
          url,
          selector.selector,
          selector.selectorType,
          selector.attributes
        );

        allResults.push(...results);
      }

      // Format results if template is provided
      const formattedResults = outputTemplate
        ? this.scrapingService.formatResults(allResults, outputTemplate)
        : allResults.map((r) => JSON.stringify(r));

      return new ScrapingResultType({
        success: true,
        results: formattedResults,
        data: allResults.length > 0 ? allResults[0] : undefined,
      });
    } catch (error) {
      console.error("Failed to scrape URL:", error);
      return new ScrapingResultType({
        success: false,
        results: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  @Mutation(() => ScrapingNode)
  async createScrapingNode(
    @Arg("data") data: ScrapingNodeDataInput,
    @Ctx() ctx: Context
  ): Promise<ScrapingNode> {
    if (!ctx.user) {
      throw new Error("Authentication required");
    }

    return new ScrapingNode(ctx.user.id, data);
  }

  @Mutation(() => ScrapingResult)
  async testScraping(
    @Arg("url") url: string,
    @Arg("selectors", () => [SelectorConfigInput])
    selectors: SelectorConfigInput[]
  ): Promise<ScrapingResult> {
    return this.scrapingService.testScraping(url, selectors);
  }
}
