/// <reference types="jest" />

import { GmailService } from '../src/integrations/gmail/service';
import { EmailTriggerNode, EmailTriggerConfig } from '../src/integrations/gmail/nodes/EmailTriggerNode';
import { EmailActionNode, EmailActionConfig } from '../src/integrations/gmail/nodes/EmailActionNode';

// Mock Gmail client
jest.mock('../src/integrations/gmail/config', () => ({
  createGmailClient: jest.fn().mockResolvedValue({
    users: {
      messages: {
        list: jest.fn().mockResolvedValue({
          data: {
            messages: [
              { id: 'msg1', threadId: 'thread1' },
              { id: 'msg2', threadId: 'thread2' }
            ]
          }
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            id: 'msg1',
            threadId: 'thread1',
            snippet: 'Test email content',
            payload: {
              headers: [
                { name: 'From', value: 'test@example.com' },
                { name: 'Subject', value: 'Test Subject' },
                { name: 'Date', value: new Date().toISOString() }
              ],
              mimeType: 'text/plain',
              body: {
                data: Buffer.from('Test email body').toString('base64')
              }
            }
          }
        }),
        send: jest.fn().mockResolvedValue({
          data: { id: 'sent-msg-1' }
        })
      }
    }
  })
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              google_tokens: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
                token_type: 'Bearer',
                expiry_date: 1234567890000
              }
            },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('Gmail Integration', () => {
  const mockUserId = 'test-user-123';

  describe('EmailTriggerNode', () => {
    it('should filter emails based on configuration', async () => {
      const config: EmailTriggerConfig = {
        pollingInterval: 5,
        fromFilter: 'test@example.com',
        subjectFilter: 'Test Subject'
      };

      const triggerNode = new EmailTriggerNode(mockUserId, config);
      const emails = await triggerNode.checkForNewEmails();

      expect(Array.isArray(emails)).toBe(true);
      expect(emails.length).toBeGreaterThan(0);
    });
  });

  describe('EmailActionNode', () => {
    it('should send email with template variables', async () => {
      const config: EmailActionConfig = {
        to: 'test@example.com',
        subject: 'Test Subject {{variable}}',
        body: 'Test Body {{content}}'
      };

      const context = {
        variable: 'Value',
        content: 'Content'
      };

      const actionNode = new EmailActionNode(mockUserId, config);
      const result = await actionNode.execute(context);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('GmailService', () => {
    it('should fetch recent emails', async () => {
      const emails = await GmailService.getRecentEmails(mockUserId);
      expect(Array.isArray(emails)).toBe(true);
      expect(emails.length).toBeGreaterThan(0);
    });

    it('should send email', async () => {
      const result = await GmailService.sendEmail(
        mockUserId,
        'test@example.com',
        'Test Subject',
        'Test Body'
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('sent-msg-1');
    });
  });
}); 
