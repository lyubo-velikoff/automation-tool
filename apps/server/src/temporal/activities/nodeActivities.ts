import type { WorkflowNode } from '../../types/workflow';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createGmailClient } from '../../integrations/gmail/config';
import { ScrapingService } from '../../services/scraping.service';
import { SelectorConfig, SelectorResult, ScrapingResult } from '../../scraping';

const scrapingService = new ScrapingService();

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

interface WorkflowContext {
  nodeResults: Record<string, any>;
}

export async function executeNode(
  node: WorkflowNode, 
  userId: string, 
  gmailToken?: string,
  context: WorkflowContext = { nodeResults: {} }
): Promise<void> {
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
    case 'MULTI_URL_SCRAPING':
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
}

async function handleGmailAction(
  node: WorkflowNode, 
  gmailToken?: string,
  context: WorkflowContext = { nodeResults: {} }
): Promise<void> {
  if (!gmailToken) {
    throw new Error('Gmail access token not found. Please reconnect your Gmail account.');
  }

  if (!node.data?.to || !node.data?.subject || !node.data?.body) {
    throw new Error('Missing required email data (to, subject, or body)');
  }

  const gmail = createGmailClient(gmailToken);

  const subject = interpolateVariables(node.data.subject, context);
  const body = interpolateVariables(node.data.body, context);

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

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

async function handleOpenAICompletion(node: WorkflowNode): Promise<void> {
  // TODO: Implement OpenAI completion logic
}

async function getSourceNodeResults(node: WorkflowNode, context: WorkflowContext): Promise<string[]> {
  const sourceNodeId = Object.keys(context.nodeResults).find(id => {
    const results = context.nodeResults[id];
    return Array.isArray(results) && results.length > 0;
  });

  if (!sourceNodeId) {
    throw new Error('No source node found with results for multi-URL scraping');
  }

  const sourceNodeResults = context.nodeResults[sourceNodeId];
  if (!sourceNodeResults || !Array.isArray(sourceNodeResults)) {
    throw new Error(`Invalid results found from source node ${sourceNodeId}`);
  }

  const urls = sourceNodeResults.filter(result => result.startsWith('http'));
  if (urls.length === 0) {
    throw new Error('No valid URLs found in source node results');
  }

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
  if (!node.data) {
    throw new Error('No data provided for multi-URL scraping node');
  }

  const selectorConfig: SelectorConfig = Array.isArray(node.data.selectors) 
    ? node.data.selectors[0]
    : {
      selector: node.data.selector,
      selectorType: node.data.selectorType || 'css',
      attributes: node.data.attributes || ['text'],
      name: 'content'
    };

  if (!selectorConfig) {
    throw new Error('No selectors provided for multi-URL scraping');
  }

  const template = node.data.template;

  const urls = await getSourceNodeResults(node, context);

  if (!urls || urls.length === 0) {
    throw new Error('No URLs found from source node');
  }

  const results = await scrapingService.scrapeUrls(
    urls, 
    selectorConfig,
    selectorConfig.selectorType,
    selectorConfig.attributes,
    node.data.batchConfig
  );

  if (template) {
    return results.map((result: ScrapingResult) => {
      let formattedResult = template;
      const value = cleanHtmlContent(result.data?.[selectorConfig.name] || '');
      formattedResult = formattedResult.replace(`{{${selectorConfig.name}}}`, value);
      return formattedResult;
    });
  }

  return results.map((result: ScrapingResult) => {
    const cleanedData = Object.fromEntries(
      Object.entries(result.data || {}).map(([key, value]) => [key, cleanHtmlContent(value)])
    );
    return JSON.stringify(cleanedData);
  });
} 
