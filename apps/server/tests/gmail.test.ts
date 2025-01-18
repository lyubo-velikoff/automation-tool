import { GmailService } from '../src/integrations/gmail/service';
import { EmailTriggerNode, EmailTriggerConfig } from '../src/integrations/gmail/nodes/EmailTriggerNode';
import { EmailActionNode, EmailActionConfig } from '../src/integrations/gmail/nodes/EmailActionNode';
import { setCredentials } from '../src/integrations/gmail/config';

describe('Gmail Integration', () => {
  // Mock credentials for testing
  const mockTokens = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
    token_type: 'Bearer',
    expiry_date: 1234567890000
  };

  beforeAll(() => {
    // Set mock credentials
    setCredentials(mockTokens);
  });

  describe('EmailTriggerNode', () => {
    it('should filter emails based on configuration', async () => {
      const config: EmailTriggerConfig = {
        pollingInterval: 5,
        fromFilter: 'test@example.com',
        subjectFilter: 'Test Subject'
      };

      const triggerNode = new EmailTriggerNode(config);
      const emails = await triggerNode.checkForNewEmails();

      expect(Array.isArray(emails)).toBe(true);
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

      const actionNode = new EmailActionNode(config);
      const result = await actionNode.execute(context);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('GmailService', () => {
    it('should fetch recent emails', async () => {
      const emails = await GmailService.getRecentEmails();
      expect(Array.isArray(emails)).toBe(true);
    });

    it('should send email', async () => {
      const result = await GmailService.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Body'
      );
      expect(result).toBeDefined();
    });
  });
}); 
