import { Field, ObjectType } from 'type-graphql';
import { GmailService, EmailData } from '../service';

@ObjectType()
export class EmailTriggerConfig {
  @Field()
  pollingInterval!: number;

  @Field({ nullable: true })
  fromFilter?: string;

  @Field({ nullable: true })
  subjectFilter?: string;

  @Field({ nullable: true })
  afterDate?: string;
}

export class EmailTriggerNode {
  private service: GmailService;
  private config: EmailTriggerConfig;
  private userId: string;

  constructor(userId: string, config: EmailTriggerConfig) {
    this.userId = userId;
    this.config = config;
    this.service = new GmailService();
  }

  async checkForNewEmails(): Promise<EmailData[]> {
    try {
      const emails = await GmailService.getRecentEmails(this.userId);
      return emails.filter(email => {
        if (this.config.fromFilter && !email.from.includes(this.config.fromFilter)) {
          return false;
        }
        if (this.config.subjectFilter && !email.subject.includes(this.config.subjectFilter)) {
          return false;
        }
        if (this.config.afterDate) {
          const emailDate = new Date(email.date);
          const filterDate = new Date(this.config.afterDate);
          if (emailDate < filterDate) {
            return false;
          }
        }
        return true;
      });
    } catch (error) {
      console.error('Failed to check for new emails:', error);
      return [];
    }
  }
} 
