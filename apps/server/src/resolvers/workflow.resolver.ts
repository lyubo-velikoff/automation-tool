import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { createClient } from "@supabase/supabase-js";
import {
  Workflow,
  CreateWorkflowInput,
  UpdateWorkflowInput
} from "../schema/workflow";

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
          user_id: context.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
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
}
