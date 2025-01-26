import { Field, ObjectType } from 'type-graphql';
import { GmailService } from '../service';

interface NodeContext {
  label?: string;
  data?: {
    label?: string;
    [key: string]: any;
  };
  results?: any[];
  [key: string]: any;
}

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
  private userId: string;

  constructor(userId: string, config: EmailActionConfig) {
    this.userId = userId;
    this.config = config;
  }

  async execute(context: Record<string, NodeContext> = {}) {
    try {
      // Support template variables in the config
      const to = this.replaceTemplateVariables(this.config.to, context);
      const subject = this.replaceTemplateVariables(this.config.subject, context);
      const body = this.replaceTemplateVariables(this.config.body, context);

      const result = await GmailService.sendEmail(this.userId, to, subject, body);
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

  private replaceTemplateVariables(text: string, context: Record<string, NodeContext>): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      // Split path and handle spaces in node labels
      const [nodeLabel, field] = path.trim().split('.');
      
      // First try to find the node by exact label
      const nodeEntry = Object.entries(context).find(([_, value]) => 
        value && 
        (value.label === nodeLabel || value.data?.label === nodeLabel)
      );

      if (nodeEntry) {
        const [_, nodeData] = nodeEntry;
        if (field === 'results') {
          // Handle both array results and direct results
          const results = nodeData.results || nodeData.data?.results;
          if (Array.isArray(results)) {
            return results.join('\n');
          }
          return String(results || '');
        }
        return String(nodeData[field] || nodeData.data?.[field] || '');
      }

      // Log available nodes for debugging
      console.log('Available nodes:', Object.entries(context).map(([id, data]) => ({
        id,
        label: data.label || data.data?.label,
        hasResults: Boolean(data.results || data.data?.results)
      })));

      return match; // Keep original if not found
    });
  }
} 
