import { Field, ObjectType } from 'type-graphql';
import { GmailService } from '../service';

@ObjectType()
export class EmailTriggerConfig {
  @Field()
  pollingInterval: number = 5; // Default 5 minutes

  @Field({ nullable: true })
  labelFilter?: string;

  @Field({ nullable: true })
  fromFilter?: string;

  @Field({ nullable: true })
  subjectFilter?: string;
}

export class EmailTriggerNode {
  private lastCheckTime: Date;
  private config: EmailTriggerConfig;
  private userId: string;

  constructor(userId: string, config: EmailTriggerConfig) {
    this.userId = userId;
    this.config = config;
    this.lastCheckTime = new Date();
  }

  async checkForNewEmails() {
    try {
      const emails = await GmailService.getRecentEmails(this.userId);
      const newEmails = emails.filter(email => {
        const emailDate = new Date(email.date);
        return emailDate > this.lastCheckTime &&
          this.matchesFilters(email);
      });

      this.lastCheckTime = new Date();
      return newEmails;
    } catch (error) {
      console.error('Error checking for new emails:', error);
      throw error;
    }
  }

  private matchesFilters(email: any) {
    if (this.config.fromFilter && 
        !email.from.toLowerCase().includes(this.config.fromFilter.toLowerCase())) {
      return false;
    }

    if (this.config.subjectFilter && 
        !email.subject.toLowerCase().includes(this.config.subjectFilter.toLowerCase())) {
      return false;
    }

    return true;
  }
} 
