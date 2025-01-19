import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { GmailService } from '../integrations/gmail/service';
import { EmailTriggerConfig } from '../integrations/gmail/nodes/EmailTriggerNode';
import { EmailActionConfig } from '../integrations/gmail/nodes/EmailActionNode';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
class Email {
  @Field()
  id: string = '';

  @Field()
  threadId: string = '';

  @Field()
  subject: string = '';

  @Field()
  from: string = '';

  @Field()
  to: string = '';

  @Field()
  date: string = '';

  @Field()
  body: string = '';
}

@Resolver()
export class GmailResolver {
  @Query(() => [Email])
  async getRecentEmails(
    @Arg('config', () => EmailTriggerConfig) config: EmailTriggerConfig,
    @Ctx() ctx: any
  ) {
    if (!ctx.user?.id) {
      throw new Error('User not authenticated');
    }
    return GmailService.getRecentEmails(ctx.user.id);
  }

  @Mutation(() => Boolean)
  async sendEmail(
    @Arg('config', () => EmailActionConfig) config: EmailActionConfig,
    @Ctx() ctx: any
  ) {
    if (!ctx.user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      await GmailService.sendEmail(
        ctx.user.id,
        config.to,
        config.subject,
        config.body
      );
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
} 
