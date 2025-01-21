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
          id: name,
          input: {
            name,
            nodes: cleanNodes,
            edges
          }
        }
      });

      toast({
        title: "Success",
        description: "Workflow saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleExecute = async (workflowId: string) => {
    try {
      const { data } = await executeWorkflow({
        variables: {
          workflowId
        }
      });

      if (!data.executeWorkflow.success) {
        throw new Error(data.executeWorkflow.message);
      }

      toast({
        title: "Success",
        description: "Workflow executed successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to execute workflow";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSchedule = async () => {
    toast({
      title: "Coming Soon",
      description: "Scheduling functionality will be implemented soon"
    });
  };

  return {
    handleSave,
    handleExecute,
    handleSchedule
  };
} 
