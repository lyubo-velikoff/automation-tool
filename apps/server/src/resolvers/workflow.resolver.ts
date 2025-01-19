import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { createClient } from "@supabase/supabase-js";
import {
  Workflow,
  CreateWorkflowInput,
  UpdateWorkflowInput
} from "../schema/workflow";
import { ObjectType, Field } from 'type-graphql';

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

@ObjectType()
class ExecutionResult {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => String, { nullable: true })
  executionId?: string;
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

    if (error) throw error;
    if (!data) throw new Error("No data returned after insert");

    return new Workflow(data);
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

  @Mutation(() => ExecutionResult)
  @Authorized()
  async executeWorkflow(
    @Arg("workflowId") workflowId: string,
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

      // Execute each node in sequence based on edges
      const nodes = workflow.nodes as any[];
      const edges = workflow.edges as any[];

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

      // Execute the workflow
      const executionId = `exec-${Date.now()}`;
      const results = new Map<string, any>();

      // Helper function to execute a node
      const executeNode = async (node: any) => {
        try {
          switch (node.type) {
            case 'gmailTrigger':
              // Implement Gmail trigger execution
              results.set(node.id, { emails: [] }); // Mock result
              break;
            case 'gmailAction':
              // Implement Gmail action execution
              results.set(node.id, { sent: true }); // Mock result
              break;
            case 'openaiCompletion':
              // Implement OpenAI completion execution
              results.set(node.id, { completion: 'Mock completion' }); // Mock result
              break;
            default:
              throw new Error(`Unknown node type: ${node.type}`);
          }

          // Execute connected nodes
          const nextNodes = nodeConnections.get(node.id) || [];
          for (const nextNodeId of nextNodes) {
            const nextNode = nodes.find(n => n.id === nextNodeId);
            if (nextNode) {
              await executeNode(nextNode);
            }
          }
        } catch (error) {
          console.error(`Error executing node ${node.id}:`, error);
          throw error;
        }
      };

      // Execute starting from each start node
      for (const startNode of startNodes) {
        await executeNode(startNode);
      }

      return {
        success: true,
        message: 'Workflow executed successfully',
        executionId,
      };
    } catch (error) {
      console.error('Workflow execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
