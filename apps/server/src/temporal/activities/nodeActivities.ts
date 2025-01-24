import type { WorkflowNode } from '../../types/workflow';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function executeNode(node: WorkflowNode, userId: string, gmailToken?: string): Promise<void> {
  console.log(`Executing node ${node.id} of type ${node.type}`);
  
  switch (node.type) {
    case 'GMAIL_TRIGGER':
      await handleGmailTrigger(node, gmailToken);
      break;
    case 'GMAIL_ACTION':
      await handleGmailAction(node, gmailToken);
      break;
    case 'OPENAI':
      await handleOpenAICompletion(node);
      break;
    case 'SCRAPING':
      await handleWebScraping(node);
      break;
    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
}

async function handleGmailTrigger(node: WorkflowNode, gmailToken?: string): Promise<void> {
  if (!gmailToken) {
    throw new Error('Gmail token not found. Please reconnect your Gmail account.');
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token: gmailToken });
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  console.log('Checking for new emails...');
}

async function handleGmailAction(node: WorkflowNode, gmailToken?: string): Promise<void> {
  if (!gmailToken) {
    throw new Error('Gmail token not found. Please reconnect your Gmail account.');
  }

  if (!node.data?.to || !node.data?.subject || !node.data?.body) {
    throw new Error('Missing required email data (to, subject, or body)');
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token: gmailToken });
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // Create email message
  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${node.data.to}`,
    `Subject: ${node.data.subject}`,
    '',
    node.data.body
  ].join('\n');

  const encodedMessage = Buffer.from(message).toString('base64')
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

async function handleWebScraping(node: WorkflowNode): Promise<void> {
  // TODO: Implement web scraping logic
  console.log('Scraping web data...');
} 
