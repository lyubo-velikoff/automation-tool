import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int, ID } from "type-graphql";
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowTag,
  WorkflowExecution
} from "../schema/workflow";
import { NodeResult } from "../schema/node-result";
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowNodeInput,
  WorkflowEdgeInput,
  CreateWorkflowTagInput,
  SaveAsTemplateInput
} from "../schema/workflow-inputs";
import { ObjectType, Field } from 'type-graphql';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createGmailClient } from '../integrations/gmail/config';
import { ScrapingService } from '../services/scraping.service';
import { getTemporalClient } from '../temporal/client';
import { Context } from "../types";
import { supabase } from '../lib/supabase';
import { OpenAIService } from '../services/openai.service';

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

interface ScrapingResult {
  results: string[];
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

@ObjectType()
class WorkflowTemplate {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [WorkflowNode])
  nodes!: WorkflowNode[];

  @Field(() => [WorkflowEdge])
  edges!: WorkflowEdge[];

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

@Resolver(Workflow)
export class WorkflowResolver {
  private currentWorkflow: Workflow | null = null;

  @Query(() => [Workflow])
  @Authorized()
  async workflows(@Ctx() ctx: Context): Promise<Workflow[]> {
    if (!ctx.supabase) {
      throw new Error("Supabase client not initialized");
    }

    // First, get all active workflows ordered by created_at desc
    const { data: workflows, error } = await ctx.supabase
      .from("workflows")
      .select("*")
      .eq("user_id", ctx.user.id)
      .eq("is_active", true)  // Only return active workflows
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
  @Authorized()
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
      .eq("is_active", true)  // Only return active workflows
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

    // Get workflow with tags
    const { data: workflowWithTags, error: getError } = await ctx.supabase
      .from("workflows")
      .select(`
        *,
        tags:workflow_tags_workflows(
          workflow_tags (
            id,
            name,
            color,
            created_at,
            updated_at
          )
        )
      `)
      .eq("id", workflow.id)
      .eq("user_id", ctx.user.id)
      .single();

    if (getError) throw getError;

    // Transform the tags structure to match the expected format
    return {
      ...workflowWithTags,
      tags: workflowWithTags.tags?.map((t: any) => t.workflow_tags) || []
    };
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
    if (Array.isArray(input.nodes)) {
      updateData.nodes = input.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          label: node.data?.label || node.label,
          // Gmail fields
          pollingInterval: node.data?.pollingInterval,
          fromFilter: node.data?.fromFilter,
          subjectFilter: node.data?.subjectFilter,
          to: node.data?.to,
          subject: node.data?.subject,
          body: node.data?.body,
          // Scraping fields
          url: node.data?.url,
          urls: node.data?.urls,
          selectors: node.data?.selectors,
          template: node.data?.template,
          batchConfig: node.data?.batchConfig,
          // OpenAI fields
          prompt: node.data?.prompt,
          model: node.data?.model,
          temperature: node.data?.temperature,
          maxTokens: node.data?.maxTokens
        }
      }));
    }
    if (Array.isArray(input.edges)) updateData.edges = input.edges;
    if (typeof input.is_active === "boolean")
      updateData.is_active = input.is_active;

    // First verify the workflow exists and belongs to the user
    const { data: existingWorkflow, error: existingError } = await ctx.supabase
      .from("workflows")
      .select()
      .eq("id", input.id)
      .eq("user_id", ctx.user.id)
      .single();

    if (existingError) throw existingError;
    if (!existingWorkflow) throw new Error("Workflow not found");

    // Update workflow
    const { error: updateError } = await ctx.supabase
      .from("workflows")
      .update(updateData)
      .eq("id", input.id)
      .eq("user_id", ctx.user.id);

    if (updateError) throw updateError;

    if (input.tag_ids !== undefined) {
      // Remove existing tags
      const { error: deleteError } = await ctx.supabase
        .from("workflow_tags_workflows")
        .delete()
        .eq("workflow_id", input.id);

      if (deleteError) throw deleteError;

      // Add new tags if any
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

    // Get updated workflow with tags
    const { data: updatedWorkflow, error: getError } = await ctx.supabase
      .from("workflows")
      .select(`
        *,
        tags:workflow_tags_workflows(
          workflow_tags (
            id,
            name,
            color,
            created_at,
            updated_at
          )
        )
      `)
      .eq("id", input.id)
      .eq("user_id", ctx.user.id)
      .single();

    if (getError) throw getError;

    // Transform the tags structure to match the expected format
    return {
      ...updatedWorkflow,
      tags: updatedWorkflow.tags?.map((t: any) => t.workflow_tags) || []
    };
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
    if (!text) return '';

    const availableNodes = Object.entries(context.nodeResults).map(([id, data]) => ({
      id,
      label: data?.label || data?.data?.label || id,
      results: data?.results || []
    }));

    // First try to match by node label
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      try {
        const [nodeIdentifier, field] = path.trim().split('.');
        
        // Find node by label first
        const nodeByLabel = availableNodes.find(node => 
          node.label.toLowerCase() === nodeIdentifier.toLowerCase()
        );

        // Then try by ID if not found by label
        const node = nodeByLabel || availableNodes.find(node => 
          node.id === nodeIdentifier
        );

        if (!node) {
          console.warn(`No node found with identifier: ${nodeIdentifier}. Available nodes:`, 
            availableNodes.map(n => ({ id: n.id, label: n.label }))
          );
          return match; // Keep original if not found
        }

        const nodeData = context.nodeResults[node.id];
        if (!nodeData) {
          console.warn(`No results found for node: ${nodeIdentifier}`);
          return '';
        }

        // Handle special fields
        if (field === 'results') {
          const results = nodeData.results;
          if (!results) {
            console.warn(`No results found in node: ${nodeIdentifier}`);
            return '';
          }
          if (Array.isArray(results)) {
            return results.join('\n');
          }
          return String(results);
        }

        // Handle nested data fields
        const value = field.split('.').reduce((obj: Record<string, any>, key: string) => obj?.[key], nodeData);
        if (value === undefined) {
          console.warn(`Field '${field}' not found in node: ${nodeIdentifier}`);
          return '';
        }

        return String(value);
      } catch (error) {
        console.error('Error interpolating variables:', error);
        return match; // Keep original on error
      }
    });
  }

  private async executeScrapingNode(node: WorkflowNode, nodeResults: Record<string, any>): Promise<any> {
    console.log('Executing scraping node with data:', JSON.stringify(node.data, null, 2));
    console.log('Node results:', nodeResults);

    if (node.type === 'MULTI_URL_SCRAPING') {
      // For multi-URL scraping, get URLs from previous node's results
      const sourceNodeId = this.getSourceNodeId(node.id);
      if (!sourceNodeId || !nodeResults[sourceNodeId]?.results) {
        throw new Error('No URLs provided for multi-URL scraping');
      }
      const urls = nodeResults[sourceNodeId].results;
      console.log('Using URLs from previous node:', urls);

      if (!node.data?.selectors?.[0]) {
        throw new Error('Missing required selector configuration');
      }

      const scrapingService = new ScrapingService();
      const firstSelector = node.data.selectors[0];
      const batchConfig = node.data.batchConfig || { batchSize: 5, rateLimit: 2 };

      try {
        console.log('Starting multi-URL scraping with config:', {
          selector: firstSelector.selector,
          selectorType: firstSelector.selectorType,
          attributes: firstSelector.attributes,
          batchConfig
        });

        const results = await scrapingService.scrapeUrls(
          urls,
          firstSelector.selector,
          firstSelector.selectorType as 'css' | 'xpath',
          firstSelector.attributes,
          batchConfig
        );

        console.log('Raw scraping results:', JSON.stringify(results, null, 2));

        if (!results || results.length === 0) {
          console.log('Warning: No results found from scraping');
        }

        // Format results using the template
        const formattedResults = node.data.template 
          ? scrapingService.formatBatchResults(results, node.data.template)
          : results.flatMap(r => r.success ? r.results.map(item => JSON.stringify(item)) : [`Error: ${r.error}`]);

        console.log('Formatted results:', JSON.stringify(formattedResults, null, 2));

        return { results: formattedResults };
      } catch (error) {
        console.error('Error in scraping service:', error);
        throw error;
      }
    } else {
      // Regular single-URL scraping
      if (!node.data?.url || !node.data?.selectors?.[0]) {
        throw new Error('Missing required scraping data (url or selector)');
      }

      const scrapingService = new ScrapingService();
      const firstSelector = node.data.selectors[0];
      console.log('Starting single-URL scraping with config:', {
        url: node.data.url,
        selector: firstSelector.selector,
        selectorType: firstSelector.selectorType,
        attributes: firstSelector.attributes
      });

      try {
        const results = await scrapingService.scrapeUrl(
          node.data.url,
          firstSelector.selector,
          firstSelector.selectorType as 'css' | 'xpath',
          firstSelector.attributes
        );

        console.log('Raw scraping results:', JSON.stringify(results, null, 2));

        if (!results || results.length === 0) {
          console.log('Warning: No results found from scraping');
        }

        // Format results using the template
        const formattedResults = node.data.template 
          ? scrapingService.formatResults(results, node.data.template)
          : results.map(r => JSON.stringify(r));

        console.log('Formatted results:', JSON.stringify(formattedResults, null, 2));

        return { results: formattedResults };
      } catch (error) {
        console.error('Error in scraping service:', error);
        throw error;
      }
    }
  }

  private getSourceNodeId(nodeId: string): string | null {
    if (!this.currentWorkflow) return null;
    const edge = this.currentWorkflow.edges.find((e: WorkflowEdge) => e.target === nodeId);
    return edge?.source || null;
  }

  private getNodeResults(type: string, result: any): string[] {
    try {
      switch (type) {
        case 'START':
          return ['Workflow started'];
        case 'SCRAPING':
          return result.results || [];
        case 'GMAIL_TRIGGER':
          return result.emails?.map((e: any) => e.snippet || '') || [];
        case 'GMAIL_ACTION':
          return ['Email sent successfully'];
        case 'OPENAI':
          if (!result.success) {
            const errorMsg = result.error?.message || result.results[0];
            throw new Error(errorMsg);
          }
          return result.results || [];
        default:
          console.warn(`Unknown node type: ${type}`);
          return [];
      }
    } catch (error) {
      console.error(`Error getting node results for type ${type}:`, error);
      throw error;
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
    @Ctx() context: any
  ): Promise<ExecutionResult> {
    // Get workflow
    const { data: workflowData, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .single();

    if (error) throw error;
    if (!workflowData) throw new Error("Workflow not found");

    this.currentWorkflow = workflowData;

    try {
      // Get the Gmail token from context.req.headers
      const gmailToken = context.req?.headers?.['gmail-token'];
      const userId = context.user?.id;

      if (!userId) {
        throw new Error("User ID is required");
      }

      // Create execution context
      const nodeResults = {} as Record<string, any>;
      const executionId = `exec-${Date.now()}`;
      const results: NodeResult[] = [];

      // Execute nodes in order based on edges
      for (const node of workflowData.nodes) {
        console.log(`Executing node: ${node.type} ${node.id}`);
        try {
          let nodeResult;
          switch (node.type) {
            case "GMAIL_TRIGGER":
              nodeResult = await this.executeGmailTrigger(node, gmailToken);
              break;
            case "GMAIL_ACTION":
              nodeResult = await this.executeGmailAction(node, gmailToken, { nodeResults });
              break;
            case "OPENAI":
              nodeResult = await this.executeOpenAINode(node, { nodeResults, userId });
              break;
            case "SCRAPING":
            case "MULTI_URL_SCRAPING":
              nodeResult = await this.executeScrapingNode(node, nodeResults);
              break;
            default:
              throw new Error(`Unsupported node type: ${node.type}`);
          }

          // Store results for next nodes
          nodeResults[node.id] = nodeResult;

          // Add to results array
          results.push(new NodeResult(
            node.id,
            "success",
            Array.isArray(nodeResult?.results) ? nodeResult.results : [JSON.stringify(nodeResult)]
          ));
        } catch (error: any) {
          console.error(`Error executing node ${node.id}:`, error);
          results.push(new NodeResult(
            node.id,
            "error",
            [error.message || "Unknown error"]
          ));
          break; // Stop execution on error
        }
      }

      // Save execution results
      const { error: saveError } = await supabase
        .from("workflow_executions")
        .insert({
          workflow_id: workflowId,
          user_id: userId,
          execution_id: executionId,
          status: results.some(r => r.status === "error") ? "error" : "success",
          results
        });

      if (saveError) {
        console.error("Error saving execution results:", saveError);
      }

      return {
        success: !results.some(r => r.status === "error"),
        message: results.some(r => r.status === "error") ? "Workflow execution failed" : "Workflow executed successfully",
        executionId,
        results
      };
    } catch (error: any) {
      console.error("Error executing workflow:", error);
      return {
        success: false,
        message: error.message || "Unknown error",
        executionId: `exec-${Date.now()}`,
        results: []
      };
    }
  }

  private getDependentNodes(nodeId: string, edges: WorkflowEdge[], nodes: WorkflowNode[]): WorkflowNode[] {
    const dependentNodes: WorkflowNode[] = [];
    const visited = new Set<string>();
    
    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      
      // Find all edges where current node is the source
      const outgoingEdges = edges.filter(e => e.source === currentId);
      for (const edge of outgoingEdges) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode) {
          dependentNodes.push(targetNode);
          traverse(edge.target);
        }
      }
    };
    
    traverse(nodeId);
    return dependentNodes;
  }

  private async executeNode(node: WorkflowNode, context: any): Promise<NodeResult> {
    try {
      let results: string[] = [];

      switch (node.type) {
        case "GMAIL_TRIGGER":
          results = await this.executeGmailTrigger(node, context.token);
          break;
        case "GMAIL_ACTION":
          results = await this.executeGmailAction(node, context.token, context);
          break;
        case "SCRAPING":
          results = await this.executeScrapingNode(node, context.nodeResults);
          break;
        case "MULTI_URL_SCRAPING":
          results = await this.executeMultiURLScrapingNode(node);
          break;
        case "OPENAI":
          results = await this.executeOpenAINode(node, context);
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      return {
        nodeId: node.id,
        status: "success",
        results
      };
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      return {
        nodeId: node.id,
        status: "error",
        results: [error instanceof Error ? error.message : "Unknown error occurred"]
      };
    }
  }

  private async executeMultiURLScrapingNode(node: WorkflowNode): Promise<string[]> {
    const scrapingService = new ScrapingService();
    
    if (!node.data) {
      throw new Error("Node data is missing");
    }

    const urls = node.data.urls || [];
    if (urls.length === 0) {
      throw new Error("No URLs provided for scraping");
    }

    const firstSelector = node.data.selectors?.[0];
    if (!firstSelector) {
      throw new Error("No selector configuration found");
    }

    const { selector, selectorType, attributes } = firstSelector;
    if (!selector || !selectorType || !attributes) {
      throw new Error("Invalid selector configuration");
    }

    const batchConfig = {
      batchSize: node.data.batchConfig?.batchSize || 5,
      rateLimit: node.data.batchConfig?.rateLimit || 10
    };

    const results = await scrapingService.scrapeUrls(
      urls,
      selector,
      selectorType as 'css' | 'xpath',
      attributes,
      batchConfig
    );

    return scrapingService.formatBatchResults(results, node.data.template);
  }

  private async executeOpenAINode(
    node: WorkflowNode,
    context: { nodeResults: Record<string, any>; userId: string }
  ): Promise<any> {
    if (!node.data?.prompt) {
      throw new Error('Missing prompt in OpenAI node');
    }

    try {
      const openaiService = await OpenAIService.create(context.userId);
      
      // Interpolate variables in prompt
      const prompt = this.interpolateVariables(node.data.prompt, context);
      if (!prompt.trim()) {
        throw new Error('Prompt is empty after variable interpolation');
      }

      console.log('Executing OpenAI node with prompt:', prompt);
      
      const result = await openaiService.complete(prompt, {
        model: node.data.model,
        temperature: node.data.temperature,
        maxTokens: node.data.maxTokens
      });

      console.log('OpenAI node execution completed successfully');

      return {
        success: true,
        results: [result],
        prompt, // Include the interpolated prompt for debugging
        model: node.data.model,
        usage: {
          prompt_tokens: prompt.length / 4, // Rough estimate
          completion_tokens: result.length / 4 // Rough estimate
        }
      };
    } catch (error) {
      console.error('OpenAI node execution error:', error);
      
      // Determine if this is a user configuration error
      const isConfigError = error instanceof Error && (
        error.message.includes('API key') ||
        error.message.includes('model not found') ||
        error.message.includes('invalid model')
      );

      return {
        success: false,
        results: [error instanceof Error ? error.message : 'Unknown error'],
        error: {
          type: isConfigError ? 'configuration' : 'execution',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
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
    @Arg("id", () => ID) id: string,
    @Ctx() context: Context
  ): Promise<Workflow> {
    try {
      const { supabase } = context;

      // Get the original workflow
      const { data: workflow, error: fetchError } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .eq("user_id", context.user.id)
        .eq("is_active", true)
        .single();

      if (fetchError) throw fetchError;
      if (!workflow) throw new Error("Workflow not found");

      // Create timestamp for unique node IDs
      const timestamp = Date.now();

      // Create new workflow object
      const { id: _, ...workflowWithoutId } = workflow;
      const newWorkflow = {
        ...workflowWithoutId,
        name: `${workflow.name} (Copy)`,
        nodes: workflow.nodes.map((node: WorkflowNode) => ({
          ...node,
          id: `${node.id}-copy-${timestamp}`,
          data: {
            ...node.data,
            label: node.data?.label || node.label,
            // Gmail fields
            pollingInterval: node.data?.pollingInterval,
            fromFilter: node.data?.fromFilter,
            subjectFilter: node.data?.subjectFilter,
            to: node.data?.to,
            subject: node.data?.subject,
            body: node.data?.body,
            // Scraping fields
            url: node.data?.url,
            selectors: node.data?.selectors,
            template: node.data?.template
          }
        })),
        edges: workflow.edges.map((edge: WorkflowEdge) => ({
          ...edge,
          id: `${edge.id}-copy-${timestamp}`,
          source: `${edge.source}-copy-${timestamp}`,
          target: `${edge.target}-copy-${timestamp}`
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
      .eq("is_active", true)  // Only return active workflows
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
