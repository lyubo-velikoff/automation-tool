import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { createClient } from "@supabase/supabase-js";
import {
  Workflow,
  CreateWorkflowInput,
  UpdateWorkflowInput
} from "../schema/workflow";
import { ObjectType, Field } from 'type-graphql';
import { google } from 'googleapis';
import OpenAI from 'openai';
import { OAuth2Client } from 'google-auth-library';
import { createGmailClient } from '../integrations/gmail/config';
import { ScrapingService } from '../integrations/scraping/service';

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error';
  results: string[];
}

interface GmailTriggerResult {
  emails: Array<{
    id?: string;
    threadId?: string;
    labelIds?: string[];
    snippet?: string | null;
  }>;
}

interface GmailActionResult {
  sent: boolean;
}

interface OpenAIResult {
  completion: string | null;
  usage?: any;
}

interface ScrapingResult {
  results: string[];
}

@ObjectType()
class NodeResult {
  @Field()
  nodeId!: string;

  @Field()
  status!: string;

  @Field(() => [String], { nullable: true })
  results?: string[];
}

@ObjectType()
class ExecutionResult {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => String, { nullable: true })
  executionId?: string;

  @Field(() => [NodeResult], { nullable: true })
  results?: NodeResult[];
}

@Resolver(Workflow)
export class WorkflowResolver {
  @Query(() => [Workflow])
  @Authorized()
  async workflows(@Ctx() context: any): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("user_id", context.user.id)
      .eq("is_active", true);

    if (error) throw error;
    return data.map((w: any) => new Workflow(w));
  }

  @Query(() => Workflow)
  @Authorized()
  async workflow(
    @Arg("id") id: string,
    @Ctx() context: any
  ): Promise<Workflow> {
    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", id)
      .eq("user_id", context.user.id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Workflow not found");
    return new Workflow(data);
  }

  @Mutation(() => Workflow)
  @Authorized()
  async createWorkflow(
    @Arg("input") input: CreateWorkflowInput,
    @Ctx() context: any
  ): Promise<Workflow> {
    try {
      console.log('Creating workflow with input:', JSON.stringify(input, null, 2));
      
      const { data, error } = await supabase
        .from("workflows")
        .insert([
          {
            name: input.name,
            description: input.description,
            nodes: input.nodes,
            edges: input.edges,
            user_id: context.user.id,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data returned after insert');
        throw new Error("No data returned after insert");
      }

      return new Workflow(data);
    } catch (error) {
      console.error('Unexpected error in createWorkflow:', error);
      throw error;
    }
  }

  @Mutation(() => Workflow)
  @Authorized()
  async updateWorkflow(
    @Arg("input") input: UpdateWorkflowInput,
    @Ctx() context: any
  ): Promise<Workflow> {
    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.description) updateData.description = input.description;
    if (input.nodes) updateData.nodes = input.nodes;
    if (input.edges) updateData.edges = input.edges;

    const { data, error } = await supabase
      .from("workflows")
      .update(updateData)
      .eq("id", input.id)
      .eq("user_id", context.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Workflow not found");
    return new Workflow(data);
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteWorkflow(
    @Arg("id") id: string,
    @Ctx() context: any
  ): Promise<boolean> {
    const { error } = await supabase
      .from("workflows")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", context.user.id);

    if (error) throw error;
    return true;
  }

  // Helper method for REST endpoint
  async saveWorkflow(
    userId: string,
    name: string,
    nodes: any[],
    edges: any[]
  ): Promise<Workflow> {
    try {
      // First verify the user exists
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

      if (userError) {
        throw new Error(`Invalid user ID: ${userError.message}`);
      }

      if (!userData?.user) {
        throw new Error("User not found");
      }

      const { data, error } = await supabase
        .from("workflows")
        .insert([
          {
            name,
            nodes,
            edges,
            user_id: userId,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned after insert");
      }

      return new Workflow(data);
    } catch (error) {
      throw error;
    }
  }

  private async getNodeCredentials(userId: string, nodeType: string) {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!settings) throw new Error('User settings not found');

    switch (nodeType) {
      case 'openaiCompletion':
        // Temporarily return empty credentials to skip OpenAI validation
        return { apiKey: 'disabled' };
      case 'GMAIL_TRIGGER':
      case 'GMAIL_ACTION':
        // Get Gmail OAuth tokens from user settings
        return { tokens: settings.gmail_tokens };
      case 'SCRAPING':
        // Scraping doesn't need credentials
        return {};
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }

  private async executeGmailTrigger(node: any, credentials: any) {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(credentials.tokens);

    const gmail = google.gmail({ 
      version: 'v1', 
      auth: oauth2Client as any // Type assertion needed due to googleapis types
    });
    
    // Get messages based on filters
    const { data: messages } = await gmail.users.messages.list({
      userId: 'me',
      q: `${node.data.fromFilter ? `from:${node.data.fromFilter}` : ''} ${node.data.subjectFilter ? `subject:${node.data.subjectFilter}` : ''}`.trim(),
      maxResults: 10
    });

    if (!messages?.messages?.length) {
      return { emails: [] };
    }

    // Get full message details for each email
    const emails = await Promise.all(
      messages.messages.map(async (message) => {
        const { data: email } = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });
        return email;
      })
    );

    return { emails };
  }

  private async executeGmailAction(node: any, context: any, inputs: any) {
    if (!context.token) {
      throw new Error('Gmail access token not found. Please reconnect your Gmail account.');
    }

    const gmail = createGmailClient(context.token);

    // Get email content from previous node or node data
    const emailContent = inputs?.emailContent || node.data.body;
    const subject = inputs?.subject || node.data.subject;
    const to = inputs?.to || node.data.to;

    // Create email message
    const message = [
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      'Content-Transfer-Encoding: 7bit',
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      emailContent
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return { sent: true };
  }

  private async executeOpenAICompletion(node: any, credentials: any, inputs: any) {
    const openai = new OpenAI({
      apiKey: credentials.apiKey
    });

    // Get prompt from previous node or node data
    const prompt = inputs?.prompt || node.data.prompt;
    const model = node.data.model || 'gpt-3.5-turbo';
    const maxTokens = node.data.maxTokens || 100;

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens
    });

    return { 
      completion: completion.choices[0]?.message?.content,
      usage: completion.usage
    };
  }

  private async executeScrapingNode(node: any, _credentials: any, inputs: any) {
    const scrapingService = new ScrapingService();
    const url = inputs?.url || node.data.url;
    const selector = inputs?.selector || node.data.selector;
    const selectorType = inputs?.selectorType || node.data.selectorType;
    const attribute = inputs?.attribute || node.data.attribute;

    const results = await scrapingService.scrapeUrl(url, selector, selectorType, attribute);
    return { results };
  }

  private getNodeResults(type: string, result: any): string[] {
    switch (type) {
      case 'SCRAPING':
        return result.results || [];
      case 'openaiCompletion':
        return [result.completion || ''];
      case 'GMAIL_TRIGGER':
        return result.emails?.map((e: any) => e.snippet || '') || [];
      case 'GMAIL_ACTION':
        return ['Email sent successfully'];
      default:
        return [];
    }
  }

  private async executeNode(node: any, inputs: any, context: any, nodeResults: NodeResult[]): Promise<void> {
    try {
      const credentials = await this.getNodeCredentials(context.user.id, node.type);
      let result;

      switch (node.type) {
        case 'GMAIL_TRIGGER':
          result = await this.executeGmailTrigger(node, credentials);
          break;
        case 'GMAIL_ACTION':
          result = await this.executeGmailAction(node, context, inputs);
          break;
        case 'openaiCompletion':
          result = await this.executeOpenAICompletion(node, credentials, inputs);
          break;
        case 'SCRAPING':
          result = await this.executeScrapingNode(node, credentials, inputs);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      nodeResults.push({
        nodeId: node.id,
        status: 'success',
        results: this.getNodeResults(node.type, result)
      });
    } catch (error) {
      nodeResults.push({
        nodeId: node.id,
        status: 'error',
        results: [error instanceof Error ? error.message : 'Unknown error']
      });
      throw error;
    }
  }

  @Mutation(() => ExecutionResult)
  @Authorized()
  async executeWorkflow(
    @Arg("workflowId", () => String) workflowId: string,
    @Ctx() context: any
  ): Promise<ExecutionResult> {
    try {
      // Get the workflow
      const { data: workflow, error: workflowError } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .eq("user_id", context.user.id)
        .single();

      if (workflowError) throw workflowError;
      if (!workflow) throw new Error("Workflow not found");

      const nodes = workflow.nodes as any[];
      const edges = workflow.edges as any[];
      const executionId = `exec-${Date.now()}`;
      const nodeResults: NodeResult[] = [];

      try {
        // Create a map of node connections
        const nodeConnections = new Map<string, string[]>();
        edges.forEach(edge => {
          if (!nodeConnections.has(edge.source)) {
            nodeConnections.set(edge.source, []);
          }
          nodeConnections.get(edge.source)!.push(edge.target);
        });

        // Find start nodes (nodes with no incoming edges)
        const startNodes = nodes.filter(node => 
          !edges.some(edge => edge.target === node.id)
        );

        // Execute starting from each start node
        for (const startNode of startNodes) {
          await this.executeNode(startNode, null, context, nodeResults);

          // Execute connected nodes
          const processConnectedNodes = async (nodeId: string, inputs: any) => {
            const nextNodes = nodeConnections.get(nodeId) || [];
            for (const nextNodeId of nextNodes) {
              const nextNode = nodes.find(n => n.id === nextNodeId);
              if (nextNode) {
                await this.executeNode(nextNode, inputs, context, nodeResults);
                await processConnectedNodes(nextNode.id, nodeResults[nodeResults.length - 1].results);
              }
            }
          };

          await processConnectedNodes(startNode.id, nodeResults[nodeResults.length - 1].results);
        }

        // Store successful execution results
        await supabase
          .from('workflow_executions')
          .insert([
            {
              workflow_id: workflowId,
              user_id: context.user.id,
              execution_id: executionId,
              status: 'completed',
              results: nodeResults
            }
          ]);

        return {
          success: true,
          message: 'Workflow executed successfully',
          executionId,
          results: nodeResults
        };
      } catch (error) {
        // Store failed execution
        await supabase
          .from('workflow_executions')
          .insert([
            {
              workflow_id: workflowId,
              user_id: context.user.id,
              execution_id: executionId,
              status: 'failed',
              results: nodeResults
            }
          ]);

        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          executionId,
          results: nodeResults
        };
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        results: []
      };
    }
  }
}
