import { createGmailClient } from './config';

export class GmailService {
  // Get list of recent emails
  static async getRecentEmails(userId: string, maxResults = 10) {
    try {
      const gmail = await createGmailClient(userId);
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
      });

      const messages = response.data.messages || [];
      const emails = await Promise.all(
        messages.map(async (message) => {
          const email = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
          });
          return this.parseEmailData(email.data);
        })
      );

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Send an email
  static async sendEmail(userId: string, to: string, subject: string, body: string) {
    try {
      const gmail = await createGmailClient(userId);
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        'From: me',
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
      ];
      const message = messageParts.join('\n');

      const encodedMessage = Buffer.from(message)
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
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Helper to parse email data
  private static parseEmailData(emailData: any) {
    const headers = emailData.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';

    let body = '';
    if (emailData.payload.parts) {
      const textPart = emailData.payload.parts.find(
        (part: any) => part.mimeType === 'text/plain'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (emailData.payload.body.data) {
      body = Buffer.from(emailData.payload.body.data, 'base64').toString();
    }

    return {
      id: emailData.id,
      threadId: emailData.threadId,
      subject,
      from,
      to,
      date,
      body,
    };
  }
} 
