import { Field, ObjectType } from 'type-graphql';
import { GmailService } from '../service';

@ObjectType()
export class EmailActionConfig {
  @Field()
  to: string = '';

  @Field()
  subject: string = '';

  @Field()
  body: string = '';

  @Field({ nullable: true })
  cc?: string;

  @Field({ nullable: true })
  bcc?: string;
}

export class EmailActionNode {
  private config: EmailActionConfig;

  constructor(config: EmailActionConfig) {
    this.config = config;
  }

  async execute(context: any = {}) {
    try {
      // Support template variables in the config
      const to = this.replaceTemplateVariables(this.config.to, context);
      const subject = this.replaceTemplateVariables(this.config.subject, context);
      const body = this.replaceTemplateVariables(this.config.body, context);

      const result = await GmailService.sendEmail(to, subject, body);
      return {
        success: true,
        messageId: result.id,
        threadId: result.threadId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private replaceTemplateVariables(text: string, context: any): string {
    return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], context);
      return value !== undefined ? String(value) : match;
    });
  }
} 
