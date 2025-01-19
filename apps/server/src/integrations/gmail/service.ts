import { createGmailClient } from './config';
import { gmail_v1 } from 'googleapis';

export interface EmailData {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  body: string;
  snippet: string;
  date: string;
}

export class GmailService {
  // Get list of recent emails
  static async getRecentEmails(userId: string, maxResults: number = 10): Promise<EmailData[]> {
    try {
      const gmail = await createGmailClient(userId);
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
      });

      if (!response.data.messages) {
        return [];
      }

      const emails = await Promise.all(
        response.data.messages.map(async (message) => {
          const emailData = await gmail.users.messages.get({
            userId: 'me',
            id: message.id || '',
          });

          return this.parseEmailData(emailData.data);
        })
      );

      return emails;
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      return [];
    }
  }

  // Send an email
  static async sendEmail(userId: string, to: string, subject: string, body: string) {
    try {
      const gmail = await createGmailClient(userId);

      // Create email in base64 format
      const email = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `To: ${to}\n`,
        `Subject: ${subject}\n\n`,
        body
      ].join('');

      const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return res.data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Helper to parse email data
  private static parseEmailData(emailData: gmail_v1.Schema$Message): EmailData {
    const headers = emailData.payload?.headers || [];
    const from = headers.find(h => h.name === 'From')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    let body = '';

    // Handle multipart messages
    if (emailData.payload?.mimeType?.includes('multipart')) {
      const textPart = emailData.payload.parts?.find(
        part => part.mimeType === 'text/plain'
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (emailData.payload?.body?.data) {
      body = Buffer.from(emailData.payload.body.data, 'base64').toString();
    }

    return {
      id: emailData.id || '',
      threadId: emailData.threadId || '',
      from,
      subject,
      body,
      snippet: emailData.snippet || '',
      date
    };
  }
} 
