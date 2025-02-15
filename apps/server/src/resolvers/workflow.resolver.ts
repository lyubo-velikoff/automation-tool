import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  Int,
  ID,
} from "type-graphql";
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowTag,
  WorkflowExecution,
} from "../schema/workflow";
import { NodeResult } from "../schema/node-result";
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowNodeInput,
  WorkflowEdgeInput,
  CreateWorkflowTagInput,
  SaveAsTemplateInput,
} from "../schema/workflow-inputs";
import { ObjectType, Field } from "type-graphql";
import { createGmailClient } from "../integrations/gmail/config";
import { ScrapingService } from "../services/scraping.service";
import { getTemporalClient } from "../temporal/client";
import { Context } from "../types";
import { supabase } from "../lib/supabase";
import { OpenAIService } from "../services/openai.service";
import { VariableService } from "../services/variable.service";
import { NodeVariablesType } from "../types/workflow";

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
  private variableService: VariableService;

  constructor() {
    this.variableService = new VariableService();
  }

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
      .eq("is_active", true) // Only return active workflows
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!workflows) return [];

    // Then, get all workflow-tag relationships for these workflows
    const workflowIds = workflows.map((w) => w.id);
    const { data: tagRelations, error: tagRelError } = await ctx.supabase
      .from("workflow_tags_workflows")
      .select("workflow_id, tag_id, workflow_tags (*)")
      .in("workflow_id", workflowIds);

    if (tagRelError) throw tagRelError;

    // Map tags to their respective workflows
    return workflows.map((workflow) => ({
      ...workflow,
      tags:
        tagRelations
          ?.filter((rel) => rel.workflow_id === workflow.id)
          .map((rel) => rel.workflow_tags) || [],
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
      .eq("is_active", true) // Only return active workflows
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
        is_active: true,
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
            tag_id,
          }))
        );

      if (tagError) throw tagError;
    }

    // Get workflow with tags
    const { data: workflowWithTags, error: getError } = await ctx.supabase
      .from("workflows")
      .select(
        `
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
      `
      )
      .eq("id", workflow.id)
      .eq("user_id", ctx.user.id)
      .single();

    if (getError) throw getError;

    // Transform the tags structure to match the expected format
    return {
      ...workflowWithTags,
      tags: workflowWithTags.tags?.map((t: any) => t.workflow_tags) || [],
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
      updateData.nodes = input.nodes.map((node) => ({
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
          maxTokens: node.data?.maxTokens,
        },
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
              tag_id,
            }))
          );

        if (tagError) throw tagError;
      }
    }

    // Get updated workflow with tags
    const { data: updatedWorkflow, error: getError } = await ctx.supabase
      .from("workflows")
      .select(
        `
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
      `
      )
      .eq("id", input.id)
      .eq("user_id", ctx.user.id)
      .single();

    if (getError) throw getError;

    // Transform the tags structure to match the expected format
    return {
      ...updatedWorkflow,
      tags: updatedWorkflow.tags?.map((t: any) => t.workflow_tags) || [],
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
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(userId);

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
            is_active: true,
          },
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
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!settings) throw new Error("User settings not found");

    switch (nodeType) {
      case "openaiCompletion":
        // Temporarily return empty credentials to skip OpenAI validation
        return { apiKey: "disabled" };
      case "GMAIL_TRIGGER":
      case "GMAIL_ACTION":
        // Get Gmail OAuth tokens from user settings
        return { tokens: settings.gmail_tokens };
      case "SCRAPING":
        // Scraping doesn't need credentials
        return {};
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }

  private async executeGmailTrigger(
    node: WorkflowNode,
    gmailToken?: string
  ): Promise<any> {
    if (!gmailToken) {
      throw new Error(
        "Gmail token not found. Please reconnect your Gmail account."
      );
    }

    const gmail = createGmailClient(gmailToken);

    return {};
  }

  private async executeGmailAction(
    node: WorkflowNode,
    gmailToken: string | undefined,
    context: { nodeResults: Record<string, any> }
  ): Promise<any> {
    if (!gmailToken) {
      throw new Error("Gmail token not found");
    }

    const gmail = createGmailClient(gmailToken);

    // Interpolate variables in subject and body
    const subject = node.data?.subject
      ? this.interpolateVariables(node.data.subject, context)
      : "";
    const body = node.data?.body
      ? this.interpolateVariables(node.data.body, context)
      : "";

    const message = [
      'Content-Type: text/plain; charset="UTF-8"',
      "MIME-Version: 1.0",
      "Content-Transfer-Encoding: 7bit",
      `To: ${node.data?.to}`,
      `Subject: ${subject}`,
      "",
      body,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return { sent: true };
  }

  private interpolateVariables(
    text: string,
    context: { nodeResults: Record<string, any> }
  ): string {
    // If no variables to replace, return original text
    if (!text.includes("{{")) {
      return text;
    }

    return text.replace(/\{\{(.*?)\}\}/g, (match, path) => {
      try {
        // Split the path into parts (e.g., ["Forum", "URls", "0"])
        const parts = path.split(/[\.\[\]]+/).filter(Boolean);
        const nodeName = parts[0];

        // Find the node by name (case-insensitive)
        const nodeData = Object.entries(context.nodeResults).find(
          ([key, value]) => {
            const label = value.label || key;
            return label.toLowerCase() === nodeName.toLowerCase();
          }
        );

        if (!nodeData) {
          return match;
        }

        // Start with the node's data
        let value = nodeData[1];

        // For OpenAI nodes, if no further path is specified, return the text directly
        if (parts.length === 1 && value.text !== undefined) {
          return value.text;
        }

        // Handle scraping node results
        if (value.bySelector) {
          // If only the node name is provided, return all results in a formatted string
          if (parts.length === 1) {
            return Object.entries(value.bySelector)
              .map(([selector, results]) => {
                return `${selector}: ${JSON.stringify(results, null, 2)}`;
              })
              .join('\n');
          }

          // Get the selector name
          const selectorName = parts[1];
          const selectorResults = value.bySelector[selectorName];

          if (!selectorResults) {
            return match;
          }

          // If an index is provided, get that specific result
          if (parts.length > 2 && !isNaN(Number(parts[2]))) {
            const index = Number(parts[2]);
            const result = selectorResults[index];
            
            // Handle nested URL objects (specific to forum scraping results)
            if (result && typeof result === 'object' && result[selectorName]) {
              return result[selectorName];
            }
            
            return result || match;
          }

          // Otherwise, return all results for this selector
          return Array.isArray(selectorResults) 
            ? selectorResults.map(r => r[selectorName] || r).join('\n')
            : JSON.stringify(selectorResults);
        }

        // Handle other node types
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (part === "results") continue;

          if (!isNaN(Number(part))) {
            const index = Number(part);
            value = Array.isArray(value) ? value[index] : value;
          } else {
            value = value[part];
          }

          if (value === undefined) {
            return match;
          }
        }

        // Convert final value to string appropriately
        if (value === null || value === undefined) {
          return match;
        } else if (typeof value === 'object') {
          return JSON.stringify(value, null, 2);
        } else {
          return String(value);
        }
      } catch (error) {
        console.error('Error interpolating variable:', error);
        return match;
      }
    });
  }

  private async executeScrapingNode(
    node: WorkflowNode,
    nodeResults: Record<string, any>
  ): Promise<any> {
    // Multi-URL scraping
    if (node.type === "MULTI_URL_SCRAPING") {
      if (
        !node.data?.urls ||
        !Array.isArray(node.data.urls) ||
        node.data.urls.length === 0
      ) {
        throw new Error("Missing URLs for multi-URL scraping");
      }

      if (
        !node.data.selectors ||
        !Array.isArray(node.data.selectors) ||
        node.data.selectors.length === 0
      ) {
        throw new Error("Missing selectors for multi-URL scraping");
      }

      const scrapingService = new ScrapingService();

      // First, resolve all URLs
      const resolvedUrls = node.data.urls.map((url) => {
        const resolved = this.interpolateVariables(url, { nodeResults });
        // If still contains variable syntax, it means resolution failed
        if (resolved.includes("{{")) {
          throw new Error(`Failed to resolve URL: ${url}`);
        }
        return resolved;
      });

      const batchConfig = {
        batchSize: node.data.batchConfig?.batchSize || 5,
        rateLimit: node.data.batchConfig?.rateLimit || 10,
      };

      try {
        // Process each selector
        const allResults = await Promise.all(
          node.data.selectors.map(async (selector) => {
            if (
              !selector.selector ||
              !selector.selectorType ||
              !selector.attributes
            ) {
              throw new Error("Invalid selector configuration");
            }

            const results = await scrapingService.scrapeUrls(
              resolvedUrls,
              {
                selector: selector.selector,
                selectorType: selector.selectorType as "css" | "xpath",
                attributes: selector.attributes,
                name: selector.name || "Default",
              },
              selector.selectorType as "css" | "xpath",
              selector.attributes,
              batchConfig
            );

            // Extract and combine results from all successful scrapes
            const combinedResults = results
              .filter((r) => r.success)
              .map((r) => r.results)
              .flat();

            return {
              name: selector.name || "Default",
              results: combinedResults,
            };
          })
        );

        // Format results by selector
        const formattedResults = {
          bySelector: allResults.reduce((acc, { name, results }) => {
            acc[name] = results;
            return acc;
          }, {} as Record<string, string[]>),
        };

        return formattedResults;
      } catch (error) {
        throw error;
      }
    }

    // Regular single-URL scraping
    if (
      !node.data?.url ||
      typeof node.data.url !== "string" ||
      !node.data.selectors ||
      node.data.selectors.length === 0
    ) {
      throw new Error("Missing required scraping data (url or selectors)");
    }

    const scrapingService = new ScrapingService();
    const url = this.interpolateVariables(node.data.url, { nodeResults });

    try {
      // Process each selector
      const allResults = await Promise.all(
        node.data.selectors.map(async (selector) => {
          if (
            !selector.selector ||
            !selector.selectorType ||
            !selector.attributes
          ) {
            throw new Error("Invalid selector configuration");
          }

          const results = await scrapingService.scrapeUrl(
            url,
            selector.selector,
            selector.selectorType as "css" | "xpath",
            selector.attributes,
            selector.name || "Default"
          );

          return {
            name: selector.name || "Default",
            results,
          };
        })
      );

      // Format results by selector
      const formattedResults = {
        bySelector: allResults.reduce((acc, { name, results }) => {
          acc[name] = results;
          return acc;
        }, {} as Record<string, string[]>),
      };

      return formattedResults;
    } catch (error) {
      console.error("Error in scraping service:", error);
      throw error;
    }
  }

  private getSourceNodeId(nodeId: string): string | null {
    if (!this.currentWorkflow) return null;
    const edge = this.currentWorkflow.edges.find(
      (e: WorkflowEdge) => e.target === nodeId
    );
    return edge?.source || null;
  }

  private getNodeResults(type: string, result: any): string[] {
    try {
      switch (type) {
        case "START":
          return ["Workflow started"];
        case "SCRAPING":
          return result.results || [];
        case "GMAIL_TRIGGER":
          return result.emails?.map((e: any) => e.snippet || "") || [];
        case "GMAIL_ACTION":
          return ["Email sent successfully"];
        case "OPENAI":
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

  private getExecutionOrder(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): WorkflowNode[] {
    // Create adjacency list
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize
    nodes.forEach((node) => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build graph
    edges.forEach((edge) => {
      graph.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Find nodes with no dependencies
    const queue = nodes
      .filter((node) => (inDegree.get(node.id) || 0) === 0)
      .map((node) => node.id);

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
    return result.map((id) => nodes.find((n) => n.id === id)!);
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
      const gmailToken = context.req?.headers?.["gmail-token"];
      const userId = context.user?.id;
      
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Create execution context
      const nodeResults = {} as Record<string, any>;
      const executionId = `exec-${Date.now()}`;
      const results: NodeResult[] = [];

      // Sort nodes in execution order
      const sortedNodes = this.getNodesInExecutionOrder(
        workflowData.nodes,
        workflowData.edges
      );

      // Execute nodes in order
      for (const node of sortedNodes) {
        const nodeName = node.data?.label || node.label || `${node.type} Node`;
        try {
          const nodeResult = await this.executeNode(node, {
            token: gmailToken,
            nodeResults,
            userId,
          });

          results.push(nodeResult);
        } catch (error: any) {
          console.error(`Error executing node ${nodeName}:`, error);
          results.push(
            new NodeResult(
              node.id,
              "error",
              [{ error: error.message || "Unknown error" }],
              nodeName
            )
          );
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
          status: results.some((r) => r.status === "error")
            ? "error"
            : "success",
          results,
        });

      if (saveError) {
        console.error("Error saving execution results:", saveError);
      }

      return {
        success: !results.some((r) => r.status === "error"),
        message: results.some((r) => r.status === "error")
          ? "Workflow execution failed"
          : "Workflow executed successfully",
        executionId,
        results,
      };
    } catch (error: any) {
      console.error("Error executing workflow:", error);
      return {
        success: false,
        message: error.message || "Unknown error",
        executionId: `exec-${Date.now()}`,
        results: [],
      };
    }
  }

  private getNodesInExecutionOrder(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): WorkflowNode[] {
    // Find root nodes (nodes with no incoming edges)
    const incomingEdges = new Map<string, number>();
    edges.forEach((edge) => {
      incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
    });

    const rootNodes = nodes.filter((node) => !incomingEdges.has(node.id));
    const visited = new Set<string>();
    const result: WorkflowNode[] = [];

    // Depth-first search to get execution order
    const visit = (node: WorkflowNode) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      result.push(node);

      // Find and visit all target nodes
      edges
        .filter((edge) => edge.source === node.id)
        .forEach((edge) => {
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (targetNode) visit(targetNode);
        });
    };

    // Visit all root nodes
    rootNodes.forEach(visit);

    // Add any remaining nodes (in case of cycles or disconnected nodes)
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        result.push(node);
      }
    });

    return result;
  }

  private getDependentNodes(
    nodeId: string,
    edges: WorkflowEdge[],
    nodes: WorkflowNode[]
  ): WorkflowNode[] {
    const dependentNodes: WorkflowNode[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      // Find all edges where current node is the source
      const outgoingEdges = edges.filter((e) => e.source === currentId);
      for (const edge of outgoingEdges) {
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          dependentNodes.push(targetNode);
          traverse(edge.target);
        }
      }
    };

    traverse(nodeId);
    return dependentNodes;
  }

  private async executeNode(
    node: WorkflowNode,
    context: any
  ): Promise<NodeResult> {
    try {
      let result: any;
      const nodeName = node.data?.label || node.label || `${node.type} Node`;

      switch (node.type) {
        case "GMAIL_TRIGGER":
          result = await this.executeGmailTrigger(node, context.token);
          break;
        case "GMAIL_ACTION":
          result = await this.executeGmailAction(node, context.token, context);
          break;
        case "SCRAPING":
        case "MULTI_URL_SCRAPING":
          result = await this.executeScrapingNode(node, context.nodeResults);
          break;
        case "OPENAI":
          const completion = await this.executeOpenAINode(node, context);
          // Store OpenAI results as an object with text property
          result = { text: completion };
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      // Store results with both ID and label for easier lookup
      if (result) {
        // Ensure all results are objects with a label
        const resultObj = {
          ...result,
          label: nodeName,
        };
        
        context.nodeResults[node.id] = resultObj;
        if (nodeName) {
          context.nodeResults[nodeName] = resultObj;
        }
      }

      return new NodeResult(node.id, "success", [result], nodeName);
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      const nodeName = node.data?.label || node.label || `${node.type} Node`;
      const errorResult = { error: error instanceof Error ? error.message : "Unknown error occurred" };
      return new NodeResult(
        node.id,
        "error",
        [errorResult],
        nodeName
      );
    }
  }

  private async executeOpenAINode(
    node: WorkflowNode,
    context: { nodeResults: Record<string, any>; userId: string }
  ): Promise<any> {
    if (!node.data?.prompt) {
      throw new Error("Missing prompt in OpenAI node");
    }

    try {
      const openaiService = await OpenAIService.create(context.userId);

      // Interpolate variables in prompt
      const prompt = this.interpolateVariables(node.data.prompt, context);
      if (!prompt.trim()) {
        throw new Error("Prompt is empty after variable interpolation");
      }

      return await openaiService.complete(prompt, {
        model: node.data.model,
        temperature: node.data.temperature,
        maxTokens: node.data.maxTokens,
      });
    } catch (error) {
      console.error("OpenAI node execution error:", error);
      throw error;
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
        return description?.status?.name === "RUNNING";
      } catch (error: any) {
        if (error.name === "WorkflowNotFoundError") {
          return false;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error checking workflow schedule:", error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async startTimedWorkflow(
    @Arg("workflowId") workflowId: string,
    @Arg("nodes", () => [WorkflowNodeInput]) nodes: WorkflowNodeInput[],
    @Arg("edges", () => [WorkflowEdgeInput]) edges: WorkflowEdgeInput[],
    @Arg("intervalMinutes", () => Int) intervalMinutes: number,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    try {
      const client = await getTemporalClient();

      // Check if workflow is already running
      const handle = client.workflow.getHandle(`timed-${workflowId}`);
      try {
        const description = await handle.describe();
        if (description?.status?.name === "RUNNING") {
          throw new Error("Workflow is already scheduled");
        }
      } catch (error: any) {
        // If workflow not found, we can proceed with starting it
        if (error.name !== "WorkflowNotFoundError") {
          throw error;
        }
      }

      // Get the Gmail token from request headers
      const gmailToken = ctx.req?.get("x-gmail-token");

      await client.workflow.start("timedWorkflow", {
        args: [
          {
            workflowId,
            nodes,
            edges,
            intervalMinutes,
            userId: ctx.user.id,
            gmailToken,
          },
        ],
        taskQueue: "automation-tool",
        workflowId: `timed-${workflowId}`,
      });

      return true;
    } catch (error) {
      console.error("Error starting timed workflow:", error);
      if (error instanceof Error) {
        throw error;
      }
      return false;
    }
  }

  @Mutation(() => Boolean)
  async stopTimedWorkflow(
    @Arg("workflowId") workflowId: string
  ): Promise<boolean> {
    try {
      const client = await getTemporalClient();
      const handle = client.workflow.getHandle(`timed-${workflowId}`);

      // Check if workflow exists before attempting to terminate
      const description = await handle.describe();
      if (!description) {
        return true;
      }

      await handle.terminate();
      return true;
    } catch (error: any) {
      // If workflow not found, consider it already stopped
      if (error.name === "WorkflowNotFoundError") {
        return true;
      }
      console.error("Error stopping timed workflow:", error);
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
            template: node.data?.template,
          },
        })),
        edges: workflow.edges.map((edge: WorkflowEdge) => ({
          ...edge,
          id: `${edge.id}-copy-${timestamp}`,
          source: `${edge.source}-copy-${timestamp}`,
          target: `${edge.target}-copy-${timestamp}`,
        })),
        user_id: context.user.id,
        is_active: true,
      };

      // Insert the new workflow
      const { data: duplicatedWorkflow, error: insertError } = await supabase
        .from("workflows")
        .insert([newWorkflow])
        .select()
        .single();

      if (insertError) {
        console.error("Error duplicating workflow:", insertError);
        throw new Error(`Failed to duplicate workflow: ${insertError.message}`);
      }
      if (!duplicatedWorkflow) throw new Error("Failed to duplicate workflow");

      return { ...duplicatedWorkflow } as Workflow;
    } catch (error) {
      console.error("Error in duplicateWorkflow:", error);
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
        user_id: ctx.user.id,
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
      .eq("is_active", true) // Only return active workflows
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
        user_id: ctx.user.id,
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

  @Query(() => NodeVariablesType)
  async getNodeVariables(
    @Arg("nodeId") nodeId: string,
    @Arg("nodeName") nodeName: string,
    @Arg("results") results: string
  ): Promise<NodeVariablesType> {
    const nodeResults = JSON.parse(results);
    const variables = this.variableService.getAvailableVariables(
      nodeName,
      nodeResults
    );

    return {
      nodeId,
      nodeName,
      variables: variables.map((v) => ({
        reference: v.reference,
        preview: v.preview,
        type: v.type,
      })),
    };
  }
}
