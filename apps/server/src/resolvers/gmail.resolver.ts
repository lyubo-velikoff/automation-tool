import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { getAuthUrl, getTokensFromCode, setCredentials } from '../integrations/gmail/config';
import { GmailService } from '../integrations/gmail/service';
import { EmailTriggerConfig } from '../integrations/gmail/nodes/EmailTriggerNode';
import { EmailActionConfig } from '../integrations/gmail/nodes/EmailActionNode';

@Resolver()
export class GmailResolver {
  @Query(() => String)
  async getGmailAuthUrl() {
    return getAuthUrl();
  }

  @Mutation(() => Boolean)
  async authenticateGmail(
    @Arg('code') code: string,
    @Ctx() ctx: any
  ) {
    try {
      const tokens = await getTokensFromCode(code);
      // Store tokens in user's session or database
      // This is just a placeholder - implement proper token storage
      ctx.user.gmailTokens = tokens;
      
      setCredentials(tokens);
      return true;
    } catch (error) {
      console.error('Gmail authentication error:', error);
      return false;
    }
  }

  @Query(() => [Email])
  async getRecentEmails(
    @Arg('config', () => EmailTriggerConfig) config: EmailTriggerConfig
  ) {
    return GmailService.getRecentEmails();
  }

  @Mutation(() => Boolean)
  async sendEmail(
    @Arg('config', () => EmailActionConfig) config: EmailActionConfig
  ) {
    try {
      await GmailService.sendEmail(config.to, config.subject, config.body);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

// Add this at the top of the file with other imports
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
