import { Router } from 'express';
import { ScrapingService } from '../services/scraping.service';

const router = Router();
const scrapingService = new ScrapingService();

router.post('/test-selector', async (req, res) => {
  try {
    const { url, selector } = req.body;

    if (!url || !selector) {
      return res.status(400).json({ 
        error: 'URL and selector configuration are required' 
      });
    }

    const results = await scrapingService.scrapeUrl(
      url,
      selector.selector,
      selector.selectorType,
      selector.attributes
    );

    // Format results if template is provided
    const formattedResults = selector.template 
      ? scrapingService.formatResults(results, selector.template)
      : results.map(r => JSON.stringify(r));

    // Return only first few results for preview
    return res.json(formattedResults.slice(0, 3));
  } catch (error) {
    console.error('Error testing selector:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to test selector' 
    });
  }
});

export default router; 
