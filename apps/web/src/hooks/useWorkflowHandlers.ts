"use client";

import { useMutation } from "@apollo/client";
import { EXECUTE_WORKFLOW, UPDATE_WORKFLOW, DELETE_WORKFLOW, DUPLICATE_WORKFLOW } from "@/graphql/mutations";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { useToast } from "@/hooks/use-toast";
import { Node, Edge } from "reactflow";

export function useWorkflowHandlers() {
  const { toast } = useToast();
  const [updateWorkflow] = useMutation(UPDATE_WORKFLOW);
  const [executeWorkflow] = useMutation(EXECUTE_WORKFLOW);
  const [deleteWorkflow] = useMutation(DELETE_WORKFLOW, {
    refetchQueries: ['GetWorkflows']
  });
  const [duplicateWorkflow] = useMutation(DUPLICATE_WORKFLOW);

  const handleSave = async (workflowId: string, name: string, nodes: Node[], edges: Edge[]) => {
    if (!nodes || !edges) {
      toast({
        title: "Error",
        description: "No workflow data to save",
        variant: "destructive"
      });
      return;
    }

    const cleanNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.data?.label || node.type,
      position: {
        x: node.position.x,
        y: node.position.y
      },
      data: {
        pollingInterval: node.data?.pollingInterval,
        fromFilter: node.data?.fromFilter,
        subjectFilter: node.data?.subjectFilter,
        to: node.data?.to,
        subject: node.data?.subject,
        body: node.data?.body,
        prompt: node.data?.prompt,
        model: node.data?.model,
        maxTokens: node.data?.maxTokens,
        url: node.data?.url,
        selector: node.data?.selector,
        selectorType: node.data?.selectorType,
        attribute: node.data?.attribute,
        label: node.data?.label
      }
    }));

    const cleanEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    }));

    try {
      await updateWorkflow({
        variables: {
          input: {
            id: workflowId,
            name,
            nodes: cleanNodes,
            edges: cleanEdges
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

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkflow({
        variables: { id }
      });
      toast({
        title: "Success",
        description: "Workflow deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete workflow",
        variant: "destructive"
      });
      console.error('Delete workflow error:', error);
    }
  };

  const handleDuplicate = async (workflowId: string) => {
    try {
      const { data } = await duplicateWorkflow({
        variables: { workflowId },
        refetchQueries: [{ query: GET_WORKFLOWS }]
      });

      if (!data.duplicateWorkflow) {
        throw new Error("Failed to duplicate workflow");
      }

      toast({
        title: "Success",
        description: "Workflow duplicated successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to duplicate workflow";
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

  const handleRestore = async (id: string) => {
    try {
      await updateWorkflow({
        variables: {
          input: {
            id,
            is_active: true
          }
        },
        refetchQueries: ['GetWorkflows']
      });
      toast({
        title: "Success",
        description: "Workflow restored successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to restore workflow",
        variant: "destructive"
      });
      console.error('Restore workflow error:', error);
    }
  };

  return {
    handleSave,
    handleExecute,
    handleDelete,
    handleDuplicate,
    handleSchedule,
    handleRestore
  };
} 
