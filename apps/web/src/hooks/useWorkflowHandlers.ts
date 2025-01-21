"use client";

import { useMutation } from "@apollo/client";
import { EXECUTE_WORKFLOW, UPDATE_WORKFLOW } from "@/graphql/mutations";
import { useToast } from "@/components/ui/use-toast";
import { Node, Edge } from "reactflow";

interface CleanNode extends Omit<Node, "data"> {
  data: Record<string, unknown>;
}

function cleanNodeForServer(node: Node): CleanNode {
  const { data, ...rest } = node;
  return {
    ...rest,
    data: {
      ...data,
      onConfigChange: undefined
    }
  };
}

export function useWorkflowHandlers() {
  const { toast } = useToast();
  const [updateWorkflow] = useMutation(UPDATE_WORKFLOW);
  const [executeWorkflow] = useMutation(EXECUTE_WORKFLOW);

  const handleSave = async (name: string, nodes: Node[], edges: Edge[]) => {
    const cleanNodes = nodes.map(cleanNodeForServer);

    try {
      await updateWorkflow({
        variables: {
          input: {
            name,
            nodes: cleanNodes,
            edges
          }
        }
      });

      toast({
        title: "Workflow saved",
        description: "Your workflow has been saved successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "An error occurred"
      });
    }
  };

  const handleExecute = async (nodes: Node[], edges: Edge[]) => {
    try {
      const cleanNodes = nodes.map(cleanNodeForServer);
      await executeWorkflow({
        variables: {
          nodes: cleanNodes,
          edges
        }
      });

      toast({
        title: "Workflow executed",
        description: "The workflow was executed successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Execution failed",
        description: error instanceof Error ? error.message : "An error occurred"
      });
    }
  };

  const handleSchedule = (_nodes: Node[], _edges: Edge[]) => {
    // For now, just show a toast since we haven't implemented scheduling yet
    // We'll use the nodes and edges parameters when we implement scheduling
    toast({
      title: "Schedule workflow",
      description: "Scheduling functionality will be implemented soon"
    });
  };

  return { handleSave, handleExecute, handleSchedule };
} 
