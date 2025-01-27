import type { WorkflowNode } from '../../types/workflow';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createGmailClient } from '../../integrations/gmail/config';
import { ScrapingService } from '../../services/scraping.service';

const scrapingService = new ScrapingService();

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

interface WorkflowContext {
  nodeResults: Record<string, any>;
}

interface SelectorResult {
  [key: string]: string;
}

interface ScrapingResult {
  success: boolean;
  error?: string;
  data?: SelectorResult;
}

interface SelectorConfig {
  selector: string;
  selectorType: 'css' | 'xpath';
  attributes: string[];
  name: string;
  description?: string;
}

export async function executeNode(
  node: WorkflowNode, 
  userId: string, 
  gmailToken?: string,
  context: WorkflowContext = { nodeResults: {} }
): Promise<void> {
  console.log(`Executing node ${node.id} of type ${node.type} with data:`, JSON.stringify(node.data, null, 2));
  
  switch (node.type) {
    case 'GMAIL_TRIGGER':
      await handleGmailTrigger(node, gmailToken);
      break;
    case 'GMAIL_ACTION':
      await handleGmailAction(node, gmailToken, context);
      break;
    case 'OPENAI':
      await handleOpenAICompletion(node);
      break;
    case 'SCRAPING':
      const results = await handleWebScraping(node);
      context.nodeResults[node.id] = results;
      break;
    case 'MULTI_URL_SCRAPING':
      console.log('Node data before multi-URL scraping:', node.data);
      const multiResults = await handleMultiURLScraping(node, context);
      context.nodeResults[node.id] = multiResults;
      break;
    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
}

function interpolateVariables(text: string, context: WorkflowContext): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const [nodeId, field] = path.trim().split('.');
    if (context.nodeResults[nodeId]) {
      if (field === 'results') {
        return Array.isArray(context.nodeResults[nodeId]) 
          ? context.nodeResults[nodeId].join('\n')
          : String(context.nodeResults[nodeId]);
      }
      return String(context.nodeResults[nodeId][field] || '');
    }
    return match; // Keep original if not found
  });
}

async function handleGmailTrigger(node: WorkflowNode, gmailToken?: string): Promise<void> {
  if (!gmailToken) {
    throw new Error('Gmail token not found. Please reconnect your Gmail account.');
  }

  const gmail = createGmailClient(gmailToken);
  console.log('Checking for new emails...');
}

async function handleGmailAction(
  node: WorkflowNode, 
  gmailToken?: string,
  context: WorkflowContext = { nodeResults: {} }
): Promise<void> {
  if (!gmailToken) {
    throw new Error('Gmail token not found. Please reconnect your Gmail account.');
  }

  if (!node.data?.to || !node.data?.subject || !node.data?.body) {
    throw new Error('Missing required email data (to, subject, or body)');
  }

  const gmail = createGmailClient(gmailToken);

  // Interpolate variables in subject and body
  const subject = interpolateVariables(node.data.subject, context);
  const body = interpolateVariables(node.data.body, context);

  // Create email message
  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${node.data.to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send email
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
  
  console.log('Email sent successfully');
}

async function handleOpenAICompletion(node: WorkflowNode): Promise<void> {
  // TODO: Implement OpenAI completion logic
  console.log('Generating AI response...');
}

async function handleWebScraping(node: WorkflowNode): Promise<string[]> {
  if (!node.data?.url || !node.data?.selectors) {
    throw new Error('Missing required scraping data (url or selectors)');
  }

  const { 
    url,
    selectors,
    template
  } = node.data;

  try {
    console.log(`Scraping ${url} with selectors:`, selectors);
    const results = await scrapingService.scrapeUrls(
      [url],
      selectors,
      undefined,
      undefined,
      node.data.batchConfig
    );
    
    console.log('Raw scraping results:', JSON.stringify(results, null, 2));
    
    // Format the results using the template
    if (template) {
      return results.map((result: ScrapingResult) => {
        if (!result.success || !result.data) {
          return `Error: ${result.error || 'Unknown error'}`;
        }
        
        let formattedResult = template;
        Object.entries(result.data).forEach(([key, value]) => {
          formattedResult = formattedResult.replace(`{{${key}}}`, value || '');
        });
        return formattedResult;
      });
    }

    // If no template, return raw data
    return results.map(result => 
      result.success && result.data ? JSON.stringify(result.data) : `Error: ${result.error || 'Unknown error'}`
    );
  } catch (error) {
    console.error('Error during web scraping:', error);
    throw error;
  }
}

async function getSourceNodeResults(node: WorkflowNode, context: WorkflowContext): Promise<string[]> {
  // Find the edge that targets this node
  const sourceNodeId = Object.keys(context.nodeResults).find(id => {
    const results = context.nodeResults[id];
    return Array.isArray(results) && results.length > 0;
  });

  if (!sourceNodeId) {
    throw new Error('No source node found with results for multi-URL scraping');
  }

  // Get the results from the source node
  const sourceNodeResults = context.nodeResults[sourceNodeId];
  if (!sourceNodeResults || !Array.isArray(sourceNodeResults)) {
    throw new Error(`Invalid results found from source node ${sourceNodeId}`);
  }

  // Filter out any non-URL results
  const urls = sourceNodeResults.filter(result => result.startsWith('http'));
  if (urls.length === 0) {
    throw new Error('No valid URLs found in source node results');
  }

  console.log('Found URLs from source node:', urls);
  return urls;
}

function cleanHtmlContent(content: string): string {
  // Remove HTML tags while preserving line breaks
  return content
    .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
    .replace(/<[^>]+>/g, '') // Remove all other HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s+/g, '\n') // Clean up spaces after newlines
    .trim(); // Remove leading/trailing whitespace
}

async function handleMultiURLScraping(node: WorkflowNode, context: WorkflowContext): Promise<string[]> {
  console.log('Starting multi-URL scraping with node:', JSON.stringify(node, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  if (!node.data) {
    throw new Error('No data provided for multi-URL scraping node');
  }

  // Handle both single selector and array of selectors
  const selectors = Array.isArray(node.data.selectors) 
    ? node.data.selectors 
    : [{
      selector: node.data.selector,
      selectorType: node.data.selectorType || 'css',
      attributes: node.data.attributes || ['text'],
      name: 'content'
    }];

  if (!selectors || selectors.length === 0) {
    throw new Error('No selectors provided for multi-URL scraping');
  }

  const template = node.data.template;

  const urls = await getSourceNodeResults(node, context);
  console.log('Source node results (URLs):', urls);

  if (!urls || urls.length === 0) {
    throw new Error('No URLs found from source node');
  }

  console.log('Using selectors:', selectors);
  const results = await scrapingService.scrapeUrls(urls, selectors, undefined, undefined, node.data.batchConfig);
  console.log('Scraping results:', results);

  // Format results using template if provided
  if (template) {
    return results.map((result: ScrapingResult) => {
      let formattedResult = template;
      selectors.forEach(selector => {
        const value = cleanHtmlContent(result.data?.[selector.name] || '');
        formattedResult = formattedResult.replace(`{{${selector.name}}}`, value);
      });
      return formattedResult;
    });
  }

  // Return raw results if no template
  return results.map((result: ScrapingResult) => {
    const cleanedData = Object.fromEntries(
      Object.entries(result.data || {}).map(([key, value]) => [key, cleanHtmlContent(value)])
    );
    return JSON.stringify(cleanedData);
  });
} 
