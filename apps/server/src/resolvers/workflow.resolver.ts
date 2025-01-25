import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int, ID } from "type-graphql";
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
import { supabase } from '../lib/supabase';

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

    // First, get all workflows ordered by created_at desc
    const { data: workflows, error } = await ctx.supabase
      .from("workflows")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

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
    // Update workflow to set is_active to false (soft delete)
    const { error } = await ctx.supabase
      .from("workflows")
      .update({ is_active: false })
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

  private async executeGmailTrigger(node: WorkflowNode, gmailToken?: string): Promise<any> {
    if (!gmailToken) {
      throw new Error('Gmail token not found. Please reconnect your Gmail account.');
    }

    const gmail = createGmailClient(gmailToken);
    console.log('Checking for new emails...');
    return {};
  }

  private async executeGmailAction(
    node: WorkflowNode, 
    gmailToken: string | undefined,
    context: { nodeResults: Record<string, any> }
  ): Promise<any> {
    if (!gmailToken) {
      throw new Error('Gmail token not found');
    }

    const gmail = createGmailClient(gmailToken);

    // Interpolate variables in subject and body
    const subject = node.data?.subject ? this.interpolateVariables(node.data.subject, context) : '';
    const body = node.data?.body ? this.interpolateVariables(node.data.body, context) : '';

    const message = [
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      'Content-Transfer-Encoding: 7bit',
      `To: ${node.data?.to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return { sent: true };
  }

  private interpolateVariables(text: string, context: { nodeResults: Record<string, any> }): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const [nodeId, field] = path.trim().split('.');
      if (context.nodeResults[nodeId]) {
        if (field === 'results') {
          const results = context.nodeResults[nodeId];
          if (Array.isArray(results)) {
            return results.join('\n');
          }
          return String(results);
        }
        return String(context.nodeResults[nodeId][field] || '');
      }
      console.log('No results found for node:', nodeId, 'Available nodes:', Object.keys(context.nodeResults));
      return match; // Keep original if not found
    });
  }

  private async executeOpenAICompletion(node: WorkflowNode): Promise<any> {
    // TODO: Implement OpenAI completion logic
    console.log('Generating AI response...');
    return {};
  }

  private async executeScrapingNode(node: WorkflowNode): Promise<any> {
    if (!node.data?.url || !node.data?.selector) {
      throw new Error('Missing required scraping data (url or selector)');
    }

    const scrapingService = new ScrapingService();
    const results = await scrapingService.scrapeUrl(
      node.data.url,
      node.data.selector,
      node.data.selectorType as 'css' | 'xpath',
      node.data.attribute || 'text'
    );

    return { results };
  }

  private getNodeResults(type: string, result: any): string[] {
    switch (type) {
      case 'START':
        return ['Workflow started'];
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

  private async executeNode(node: WorkflowNode, context: any): Promise<NodeResult> {
    try {
      const nodeContext = {
        nodeResults: context.nodeResults || {}
      };

      let result;
      switch (node.type) {
        case 'START':
          result = { results: ['Workflow started'] };
          break;
        case 'GMAIL_TRIGGER':
          result = await this.executeGmailTrigger(node, context.token);
          break;
        case 'GMAIL_ACTION':
          result = await this.executeGmailAction(node, context.token, nodeContext);
          break;
        case 'OPENAI':
          result = await this.executeOpenAICompletion(node);
          break;
        case 'SCRAPING':
          result = await this.executeScrapingNode(node);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const nodeResult = {
        nodeId: node.id,
        status: 'success',
        results: this.getNodeResults(node.type, result)
      };

      // Store results in context for next nodes
      context.nodeResults = {
        ...context.nodeResults,
        [node.id]: result.results || result // Store raw results for interpolation
      };

      return nodeResult;
    } catch (error) {
      return {
        nodeId: node.id,
        status: 'error',
        results: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
    // Create adjacency list
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    // Build graph
    edges.forEach(edge => {
      graph.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Find nodes with no dependencies
    const queue = nodes
      .filter(node => (inDegree.get(node.id) || 0) === 0)
      .map(node => node.id);
    
    const result: string[] = [];
    
    // Process queue
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    // Map back to nodes
    return result.map(id => nodes.find(n => n.id === id)!);
  }

  @Mutation(() => ExecutionResult)
  @Authorized()
  async executeWorkflow(
    @Arg("workflowId", () => String) workflowId: string,
    @Ctx() context: Context
  ): Promise<ExecutionResult> {
    try {
      // Get the Gmail token from context.req.headers
      const gmailToken = context.req?.get('x-gmail-token');
      
      // Add token to context for node execution
      const executionContext = {
        token: gmailToken,
        nodeResults: {} as Record<string, string[]>
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

      const nodes = workflow.nodes as WorkflowNode[];
      const edges = workflow.edges as WorkflowEdge[];
      const executionId = `exec-${Date.now()}`;
      const nodeResults: NodeResult[] = [];

      try {
        // Get execution order using topological sort
        const orderedNodes = this.getExecutionOrder(nodes, edges);
        console.log('Execution order:', orderedNodes.map(n => n.type));

        // Execute nodes in order
        for (const node of orderedNodes) {
          console.log('Executing node:', node.type, node.id);
          const result = await this.executeNode(node, executionContext);
          nodeResults.push(result);
          console.log('Node results:', executionContext.nodeResults);
        }

        // Store successful execution results
        await supabase
          .from('workflow_executions')
          .insert([{
            workflow_id: workflowId,
            user_id: context.user.id,
            execution_id: executionId,
            status: 'completed',
            results: nodeResults
          }]);

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

        throw error;
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        executionId: undefined,
        results: []
      };
    }
  }

  @Query(() => Boolean)
  @Authorized()
  async isWorkflowScheduled(
    @Arg("workflowId", () => ID) workflowId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      const client = await getTemporalClient();
      const handle = client.workflow.getHandle(`timed-${workflowId}`);
      
      try {
        const description = await handle.describe();
        return description?.status?.name === 'RUNNING';
      } catch (error: any) {
        if (error.name === 'WorkflowNotFoundError') {
          return false;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error checking workflow schedule:', error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async startTimedWorkflow(
    @Arg('workflowId') workflowId: string,
    @Arg('nodes', () => [WorkflowNodeInput]) nodes: WorkflowNodeInput[],
    @Arg('edges', () => [WorkflowEdgeInput]) edges: WorkflowEdgeInput[],
    @Arg('intervalMinutes', () => Int) intervalMinutes: number,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      const client = await getTemporalClient();
      
      // Check if workflow is already running
      const handle = client.workflow.getHandle(`timed-${workflowId}`);
      try {
        const description = await handle.describe();
        if (description?.status?.name === 'RUNNING') {
          throw new Error('Workflow is already scheduled');
        }
      } catch (error: any) {
        // If workflow not found, we can proceed with starting it
        if (error.name !== 'WorkflowNotFoundError') {
          throw error;
        }
      }
      
      // Get the Gmail token from request headers
      const gmailToken = ctx.req?.get('x-gmail-token');
      
      await client.workflow.start('timedWorkflow', {
        args: [{ workflowId, nodes, edges, intervalMinutes, userId: ctx.user.id, gmailToken }],
        taskQueue: 'automation-tool',
        workflowId: `timed-${workflowId}`,
      });

      return true;
    } catch (error) {
      console.error('Error starting timed workflow:', error);
      if (error instanceof Error) {
        throw error;
      }
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
      
      // Check if workflow exists before attempting to terminate
      const description = await handle.describe();
      if (!description) {
        console.log('Workflow not found, considering it already stopped');
        return true;
      }
      
      await handle.terminate();
      return true;
    } catch (error: any) {
      // If workflow not found, consider it already stopped
      if (error.name === 'WorkflowNotFoundError') {
        console.log('Workflow not found, considering it already stopped');
        return true;
      }
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
