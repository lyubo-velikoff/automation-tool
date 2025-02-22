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
import { GET_WORKFLOWS, GET_WORKFLOW_EXECUTIONS } from "@/graphql/queries";
import { useToast } from "@/hooks/use-toast";
import { Node, Edge } from "reactflow";
import type { 
  CreateWorkflowInput,
  CreateWorkflowTagInput,
  SaveAsTemplateInput,
  UpdateWorkflowInput,
  WorkflowNodeInput,
  WorkflowEdgeInput,
  NodeDataInput
} from '@/gql/graphql';
import { NodeData } from "@/components/workflow/config/nodeTypes";

export function useWorkflowHandlers() {
  const { toast } = useToast();
  const [executeWorkflow] = useMutation(EXECUTE_WORKFLOW);
  const [updateWorkflow] = useMutation(UPDATE_WORKFLOW);
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
  const [deleteWorkflowTemplate] = useMutation(DELETE_WORKFLOW_TEMPLATE, {
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

    // Clean nodes while preserving all data fields except __typename and ReactFlow fields
    const cleanNodes = nodes.map(node => {
      // Get a clean copy of the data without special fields
      const cleanData = { ...node.data };
      delete cleanData.__typename;
      delete cleanData.onConfigChange;
      delete cleanData.selected;
      delete cleanData.dragging;
      
      // Keep label in both places for backward compatibility
      const label = cleanData.label || node.data?.label;

      // Base node data structure with common fields
      const baseNodeData = {
        label,
        pollingInterval: cleanData.pollingInterval || null,
        fromFilter: cleanData.fromFilter || null,
        subjectFilter: cleanData.subjectFilter || null,
        to: cleanData.to || null,
        subject: cleanData.subject || null,
        body: cleanData.body || null,
        url: cleanData.url || null,
        template: cleanData.template || null,
        prompt: cleanData.prompt || null,
        model: cleanData.model || null,
        temperature: cleanData.temperature || null,
        maxTokens: cleanData.maxTokens || null
      };

      // Transform scraping node data to match GraphQL schema
      if (node.type === 'SCRAPING' || node.type === 'MULTI_URL_SCRAPING') {
        const cleanSelectors = cleanData.selectors?.map(selector => ({
          selector: selector.selector || "",
          selectorType: selector.selectorType || "css",
          attributes: selector.attributes || ["text"],
          name: selector.name || label || "Content",
          description: selector.description || null
        })) || [{
          selector: "",
          selectorType: "css",
          attributes: ["text"],
          name: label || "Content",
          description: null
        }];

        // For MULTI_URL_SCRAPING, combine urlTemplate into template if it exists
        const finalTemplate = node.type === 'MULTI_URL_SCRAPING' && cleanData.urlTemplate
          ? cleanData.urlTemplate
          : cleanData.template || null;

        return {
          id: node.id,
          type: node.type,
          label,
          position: {
            x: node.position.x,
            y: node.position.y
          },
          data: {
            ...baseNodeData,
            selectors: cleanSelectors,
            urls: cleanData.urls || [],
            template: finalTemplate,
            batchConfig: cleanData.batchConfig ? {
              batchSize: cleanData.batchConfig.batchSize || 5,
              rateLimit: cleanData.batchConfig.rateLimit || 10
            } : {
              batchSize: 5,
              rateLimit: 10
            }
          }
        };
      }

      // For other node types, return cleaned data
      return {
        id: node.id,
        type: node.type,
        label,
        position: {
          x: node.position.x,
          y: node.position.y
        },
        data: baseNodeData
      };
    });

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
        },
        refetchQueries: [{
          query: GET_WORKFLOW_EXECUTIONS,
          variables: { workflowId }
        }],
        awaitRefetchQueries: true
      });

      if (!data.executeWorkflow.success) {
        toast({
          title: "Error",
          description: data.executeWorkflow.message,
          variant: "destructive"
        });
        return;
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
        variables: { id: workflowId },
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

  const handleSchedule = async () => {};

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
      await deleteWorkflowTemplate({
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
