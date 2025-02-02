import { Router } from 'express';
import { ScrapingService } from '../services/scraping.service';
import { SelectorConfig, ScrapeRequest } from '../types/scraping';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

const router = Router();
const scrapingService = new ScrapingService();

// Validation middleware
const validateRequest = async (req: any, res: any, next: any) => {
  const scrapeRequest = plainToClass(ScrapeRequest, req.body);
  const errors = await validate(scrapeRequest);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      details: errors.map(error => ({
        property: error.property,
        constraints: error.constraints
      }))
    });
  }
  
  if (scrapeRequest.selectors && scrapeRequest.selectors.length > 15) {
    return res.status(400).json({
      success: false,
      error: 'TOO_MANY_SELECTORS',
      message: 'Maximum of 15 selectors allowed per request'
    });
  }

  // Check for duplicate selector names
  if (scrapeRequest.selectors) {
    const names = scrapeRequest.selectors.map(s => s.name);
    if (new Set(names).size !== names.length) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE_SELECTOR_NAMES',
        message: 'Selector names must be unique'
      });
    }
  }

  next();
};

router.post('/test-scraping', validateRequest, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { url, selectors = [] } = req.body as ScrapeRequest;
    const results: { [key: string]: any[] } = {};
    const warnings: string[] = [];

    // Process each selector
    await Promise.all(selectors.map(async (selector: SelectorConfig) => {
      try {
        const selectorResults = await scrapingService.scrapeUrl(
          url,
          selector.selector,
          selector.selectorType,
          selector.attributes,
          selector.name
        );

        if (selectorResults.length === 0) {
          warnings.push(`Selector '${selector.name}' returned no results`);
        }

        results[selector.name] = selectorResults;
      } catch (error) {
        warnings.push(`Failed to process selector '${selector.name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }));

    // Return response with metadata
    return res.json({
      success: true,
      results,
      metadata: {
        engine: 'cheerio+xpath',
        processingTime: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    });

  } catch (error) {
    console.error('Error in test-scraping:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      metadata: {
        engine: 'cheerio+xpath',
        processingTime: Date.now() - startTime
      }
    });
  }
});

export default router; 
