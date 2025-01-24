import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int, ID } from "type-graphql";
import { createClient } from "@supabase/supabase-js";
import {
  Workflow,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeInput,
  WorkflowEdgeInput,
  WorkflowTag,
  CreateWorkflowTagInput,
  WorkflowTemplate,
  SaveAsTemplateInput,
  WorkflowExecution
} from "../schema/workflow";
import { ObjectType, Field } from 'type-graphql';
import { google } from 'googleapis';
import OpenAI from 'openai';
import { OAuth2Client } from 'google-auth-library';
import { createGmailClient } from '../integrations/gmail/config';
import { ScrapingService } from '../integrations/scraping/service';
import { getTemporalClient } from '../temporal/client';
import { Context } from "../types";

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
export class NodeResult {
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
  async workflows(@Ctx() ctx: Context): Promise<Workflow[]> {
    if (!ctx.supabase) {
      throw new Error("Supabase client not initialized");
    }

    // First, get all workflows
    const { data: workflows, error } = await ctx.supabase
      .from("workflows")
      .select("*")
      .eq("user_id", ctx.user.id);

    if (error) throw error;
    if (!workflows) return [];

    // Then, get all workflow-tag relationships for these workflows
    const workflowIds = workflows.map(w => w.id);
    const { data: tagRelations, error: tagRelError } = await ctx.supabase
      .from("workflow_tags_workflows")
      .select("workflow_id, tag_id, workflow_tags (*)")
      .in("workflow_id", workflowIds);

    if (tagRelError) throw tagRelError;

    // Map tags to their respective workflows
    return workflows.map(workflow => ({
      ...workflow,
      tags: tagRelations
        ?.filter(rel => rel.workflow_id === workflow.id)
        .map(rel => rel.workflow_tags) || []
    }));
  }

  @Query(() => [WorkflowTemplate])
  async workflowTemplates(@Ctx() ctx: Context): Promise<WorkflowTemplate[]> {
    const { data: templates, error } = await ctx.supabase
      .from("workflow_templates")
      .select("*")
      .eq("user_id", ctx.user.id);

    if (error) throw error;
    return templates;
  }

  @Query(() => [WorkflowTag])
  async workflowTags(@Ctx() ctx: Context): Promise<WorkflowTag[]> {
    const { data: tags, error } = await ctx.supabase
      .from("workflow_tags")
      .select("*")
      .eq("user_id", ctx.user.id);

    if (error) throw error;
    return tags;
  }

  @Query(() => Workflow)
  @Authorized()
  async workflow(
    @Arg("id", () => ID) id: string,
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

    return {
      ...data,
      nodes: data.nodes.map((node: any) => ({
        ...node,
        label: node.label || `${node.type} Node`,
      })),
    };
  }

  @Mutation(() => Workflow)
  @Authorized()
  async createWorkflow(
    @Arg("input") input: CreateWorkflowInput,
    @Ctx() ctx: Context
  ): Promise<Workflow> {
    const { data: workflow, error } = await ctx.supabase
      .from("workflows")
      .insert({
        name: input.name,
        description: input.description,
        nodes: input.nodes,
        edges: input.edges,
        user_id: ctx.user.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    if (input.tag_ids?.length) {
      const { error: tagError } = await ctx.supabase
        .from("workflow_tags_workflows")
        .insert(
          input.tag_ids.map((tag_id) => ({
            workflow_id: workflow.id,
            tag_id
          }))
        );

      if (tagError) throw tagError;
    }

    return workflow;
  }

  @Mutation(() => Workflow)
  @Authorized()
  async updateWorkflow(
    @Arg("input") input: UpdateWorkflowInput,
    @Ctx() ctx: Context
  ): Promise<Workflow> {
    const updateData: any = {};
    if (typeof input.name === "string") updateData.name = input.name;
    if (typeof input.description === "string")
      updateData.description = input.description;
    if (Array.isArray(input.nodes)) updateData.nodes = input.nodes;
    if (Array.isArray(input.edges)) updateData.edges = input.edges;
    if (typeof input.is_active === "boolean")
      updateData.is_active = input.is_active;

    const { data: workflow, error } = await ctx.supabase
      .from("workflows")
      .update(updateData)
      .eq("id", input.id)
      .eq("user_id", ctx.user.id)
      .select()
      .single();

    if (error) throw error;

    if (input.tag_ids) {
      // Remove existing tags
      await ctx.supabase
        .from("workflow_tags_workflows")
        .delete()
        .eq("workflow_id", input.id);

      // Add new tags
      if (input.tag_ids.length > 0) {
        const { error: tagError } = await ctx.supabase
          .from("workflow_tags_workflows")
          .insert(
            input.tag_ids.map((tag_id) => ({
              workflow_id: input.id,
              tag_id
            }))
          );

        if (tagError) throw tagError;
      }
    }

    return workflow;
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteWorkflow(
    @Arg("id", () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const { error } = await ctx.supabase
      .from("workflows")
      .delete()
      .eq("id", id)
      .eq("user_id", ctx.user.id);

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

      return { ...data } as Workflow;
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
      // Get the Gmail token from context.req.headers
      const gmailToken = context.req?.headers['x-gmail-token'];
      
      // Add token to context for node execution
      const executionContext = {
        ...context,
        token: gmailToken
      };

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
          await this.executeNode(startNode, null, executionContext, nodeResults);

          // Execute connected nodes
          const processConnectedNodes = async (nodeId: string, inputs: any) => {
            const nextNodes = nodeConnections.get(nodeId) || [];
            for (const nextNodeId of nextNodes) {
              const nextNode = nodes.find(n => n.id === nextNodeId);
              if (nextNode) {
                await this.executeNode(nextNode, inputs, executionContext, nodeResults);
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

  @Mutation(() => Boolean)
  async startTimedWorkflow(
    @Arg('workflowId') workflowId: string,
    @Arg('nodes', () => [WorkflowNodeInput]) nodes: WorkflowNodeInput[],
    @Arg('edges', () => [WorkflowEdgeInput]) edges: WorkflowEdgeInput[],
    @Arg('intervalMinutes', () => Int) intervalMinutes: number
  ): Promise<boolean> {
    try {
      const client = await getTemporalClient();
      
      await client.workflow.start('timedWorkflow', {
        args: [{ workflowId, nodes, edges, intervalMinutes }],
        taskQueue: 'automation-tool',
        workflowId: `timed-${workflowId}`,
      });

      return true;
    } catch (error) {
      console.error('Error starting timed workflow:', error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async stopTimedWorkflow(
    @Arg('workflowId') workflowId: string
  ): Promise<boolean> {
    try {
      const client = await getTemporalClient();
      const handle = client.workflow.getHandle(`timed-${workflowId}`);
      await handle.terminate();
      return true;
    } catch (error) {
      console.error('Error stopping timed workflow:', error);
      return false;
    }
  }

  @Mutation(() => Workflow)
  @Authorized()
  async duplicateWorkflow(
    @Arg("workflowId") workflowId: string,
    @Ctx() context: any
  ): Promise<Workflow> {
    try {
      // Get the original workflow
      const { data: originalWorkflow, error: workflowError } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .eq("user_id", context.user.id)
        .single();

      if (workflowError) throw workflowError;
      if (!originalWorkflow) throw new Error("Workflow not found");

      // Create a copy with a new name, preserving necessary data
      const newWorkflow = {
        name: `${originalWorkflow.name} (Copy)`,
        description: originalWorkflow.description,
        nodes: originalWorkflow.nodes.map((node: WorkflowNode) => ({
          ...node,
          id: `${node.id}-copy-${Date.now()}` // Ensure unique node IDs
        })),
        edges: originalWorkflow.edges.map((edge: WorkflowEdge) => ({
          ...edge,
          id: `${edge.id}-copy-${Date.now()}`, // Ensure unique edge IDs
          source: `${edge.source}-copy-${Date.now()}`, // Update source to match new node IDs
          target: `${edge.target}-copy-${Date.now()}` // Update target to match new node IDs
        })),
        user_id: context.user.id,
        is_active: true
      };

      // Insert the new workflow
      const { data: duplicatedWorkflow, error: insertError } = await supabase
        .from("workflows")
        .insert([newWorkflow])
        .select()
        .single();

      if (insertError) {
        console.error('Error duplicating workflow:', insertError);
        throw new Error(`Failed to duplicate workflow: ${insertError.message}`);
      }
      if (!duplicatedWorkflow) throw new Error("Failed to duplicate workflow");

      return { ...duplicatedWorkflow } as Workflow;
    } catch (error) {
      console.error('Error in duplicateWorkflow:', error);
      throw error;
    }
  }

  @Mutation(() => WorkflowTag)
  async createWorkflowTag(
    @Arg("input") input: CreateWorkflowTagInput,
    @Ctx() ctx: Context
  ): Promise<WorkflowTag> {
    const { data: tag, error } = await ctx.supabase
      .from("workflow_tags")
      .insert({
        name: input.name,
        color: input.color,
        user_id: ctx.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return tag;
  }

  @Mutation(() => Boolean)
  async deleteWorkflowTag(
    @Arg("id", () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const { error } = await ctx.supabase
      .from("workflow_tags")
      .delete()
      .eq("id", id)
      .eq("user_id", ctx.user.id);

    if (error) throw error;
    return true;
  }

  @Mutation(() => WorkflowTemplate)
  async saveWorkflowAsTemplate(
    @Arg("input") input: SaveAsTemplateInput,
    @Ctx() ctx: Context
  ): Promise<WorkflowTemplate> {
    // Get the workflow
    const { data: workflow, error: workflowError } = await ctx.supabase
      .from("workflows")
      .select("*")
      .eq("id", input.workflow_id)
      .eq("user_id", ctx.user.id)
      .single();

    if (workflowError) throw workflowError;

    // Save as template
    const { data: template, error } = await ctx.supabase
      .from("workflow_templates")
      .insert({
        name: input.name || workflow.name,
        description: input.description || workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        user_id: ctx.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return template;
  }

  @Mutation(() => Boolean)
  async deleteWorkflowTemplate(
    @Arg("id", () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const { error } = await ctx.supabase
      .from("workflow_templates")
      .delete()
      .eq("id", id)
      .eq("user_id", ctx.user.id);

    if (error) throw error;
    return true;
  }

  @Query(() => [WorkflowExecution])
  @Authorized()
  async workflowExecutions(
    @Arg("workflowId", () => ID) workflowId: string,
    @Ctx() ctx: Context
  ): Promise<WorkflowExecution[]> {
    const { data: executions, error } = await ctx.supabase
      .from("workflow_executions")
      .select("*")
      .eq("workflow_id", workflowId)
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return executions || [];
  }
}
