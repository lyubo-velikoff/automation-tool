"use client";

import { useMutation } from "@apollo/client";
import {
  EXECUTE_WORKFLOW,
  UPDATE_WORKFLOW,
  DELETE_WORKFLOW,
  DUPLICATE_WORKFLOW,
  CREATE_WORKFLOW,
  CREATE_WORKFLOW_TAG,
  DELETE_WORKFLOW_TAG,
  SAVE_AS_TEMPLATE,
  DELETE_WORKFLOW_TEMPLATE
} from "@/graphql/mutations";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { useToast } from "@/hooks/use-toast";
import { Node, Edge } from "reactflow";

interface CreateWorkflowInput {
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  tag_ids?: string[];
}

interface CreateWorkflowTagInput {
  name: string;
  color: string;
}

interface SaveAsTemplateInput {
  workflow_id: string;
  name?: string;
  description?: string;
}

export function useWorkflowHandlers() {
  const { toast } = useToast();
  const [updateWorkflow] = useMutation(UPDATE_WORKFLOW);
  const [executeWorkflow] = useMutation(EXECUTE_WORKFLOW);
  const [deleteWorkflow] = useMutation(DELETE_WORKFLOW, {
    refetchQueries: ['GetWorkflows']
  });
  const [duplicateWorkflow] = useMutation(DUPLICATE_WORKFLOW);
  const [createWorkflow] = useMutation(CREATE_WORKFLOW, {
    refetchQueries: ["GetWorkflows"]
  });
  const [createWorkflowTag] = useMutation(CREATE_WORKFLOW_TAG, {
    refetchQueries: ["GetWorkflowTags"]
  });
  const [deleteWorkflowTag] = useMutation(DELETE_WORKFLOW_TAG, {
    refetchQueries: ["GetWorkflowTags"]
  });
  const [saveAsTemplate] = useMutation(SAVE_AS_TEMPLATE, {
    refetchQueries: ["GetWorkflowTemplates"]
  });
  const [deleteTemplate] = useMutation(DELETE_WORKFLOW_TEMPLATE, {
    refetchQueries: ["GetWorkflowTemplates"]
  });

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
      target: edge.target,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null
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

  const handleCreate = async (input: CreateWorkflowInput) => {
    try {
      const { data } = await createWorkflow({
        variables: { input }
      });

      toast({
        title: "Success",
        description: "Workflow created successfully"
      });

      return data.createWorkflow;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleCreateTag = async (input: CreateWorkflowTagInput) => {
    try {
      const { data } = await createWorkflowTag({
        variables: { input }
      });

      toast({
        title: "Success",
        description: "Tag created successfully"
      });

      return data.createWorkflowTag;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create tag",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteWorkflowTag({
        variables: { id }
      });

      toast({
        title: "Success",
        description: "Tag deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete tag",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSaveAsTemplate = async (input: SaveAsTemplateInput) => {
    try {
      const { data } = await saveAsTemplate({
        variables: { input }
      });

      toast({
        title: "Success",
        description: "Workflow saved as template successfully"
      });

      return data.saveWorkflowAsTemplate;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save workflow as template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate({
        variables: { id }
      });

      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    handleSave,
    handleExecute,
    handleDelete,
    handleDuplicate,
    handleSchedule,
    handleRestore,
    handleCreate,
    handleCreateTag,
    handleDeleteTag,
    handleSaveAsTemplate,
    handleDeleteTemplate
  };
} 
