import type { WorkflowNode } from '../../types/workflow';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createGmailClient } from '../../integrations/gmail/config';
import { ScrapingService } from '../../services/scraping.service';

const scrapingService = new ScrapingService();

interface WorkflowContext {
  nodeResults: Record<string, any>;
}

export async function executeNode(
  node: WorkflowNode, 
  userId: string, 
  gmailToken?: string,
  context: WorkflowContext = { nodeResults: {} }
): Promise<void> {
  console.log(`Executing node ${node.id} of type ${node.type}`);
  
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
  if (!node.data?.url || !node.data?.selector) {
    throw new Error('Missing required scraping data (url or selector)');
  }

  const { 
    url, 
    selector, 
    selectorType = 'css',
    attributes = ['text', 'href'],
    template = '[{text}]({href})'
  } = node.data;

  try {
    console.log(`Scraping ${url} with selector: ${selector}`);
    const results = await scrapingService.scrapeUrl(
      url,
      selector,
      selectorType as 'css' | 'xpath',
      attributes
    );
    
    // Format the results using the template
    const formattedResults = scrapingService.formatResults(results, template);
    console.log('Formatted scraping results:', formattedResults);
    return formattedResults;
  } catch (error) {
    console.error('Error during web scraping:', error);
    throw error;
  }
} 
