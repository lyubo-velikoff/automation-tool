"use client";

import { useRef } from "react";
import { Edge, Node } from "reactflow";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import { useMutation } from "@apollo/client";
import {
  CREATE_WORKFLOW,
  EXECUTE_WORKFLOW,
  UPDATE_WORKFLOW
} from "@/graphql/mutations";
import { useToast } from "@/components/ui/use-toast";
import ExecutionHistory from "@/components/workflow/ExecutionHistory";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/workflow/loading-skeleton";
import { useWorkflowSelection } from "@/hooks/useWorkflowSelection";
import { Header } from "@/components/ui/Header";

interface CleanNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export default function WorkflowsPage() {
  const { toast } = useToast();
  const executionHistoryRef = useRef<{ fetchExecutions: () => Promise<void> }>(
    null
  );
  const { session, loading } = useAuth();
  const { selectedWorkflow } = useWorkflowSelection();

  const [createWorkflow, { loading: saveLoading }] = useMutation(
    CREATE_WORKFLOW,
    {
      onError: (error) => {
        console.error("GraphQL error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save workflow"
        });
      },
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Workflow saved successfully!"
        });
      }
    }
  );

  const [updateWorkflow, { loading: updateLoading }] = useMutation(
    UPDATE_WORKFLOW,
    {
      onError: (error) => {
        console.error("GraphQL error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update workflow"
        });
      },
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Workflow updated successfully!"
        });
      }
    }
  );

  const [executeWorkflow, { loading: executeLoading }] = useMutation(
    EXECUTE_WORKFLOW,
    {
      onError: (error) => {
        console.error("Execution error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to execute workflow"
        });
      },
      onCompleted: async (data) => {
        if (data.executeWorkflow.success) {
          toast({
            title: "Success",
            description:
              data.executeWorkflow.message || "Workflow executed successfully!"
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              data.executeWorkflow.message || "Failed to execute workflow"
          });
        }

        await executionHistoryRef.current?.fetchExecutions();
      }
    }
  );

  const cleanNodeForServer = (node: Node): CleanNode => {
    const cleanData = { ...node.data };
    delete cleanData.onConfigChange;

    return {
      id: node.id,
      type: node.type || "default",
      label: node.data?.label || "Untitled Node",
      position: node.position,
      data: cleanData
    };
  };

  const handleSave = async (name: string, nodes: Node[], edges: Edge[]) => {
    if (!name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a workflow name"
      });
      return;
    }

    const cleanNodes = nodes.map(cleanNodeForServer);

    if (selectedWorkflow) {
      // Update existing workflow
      await updateWorkflow({
        variables: {
          id: selectedWorkflow,
          input: {
            name,
            nodes: cleanNodes,
            edges
          }
        }
      });
    } else {
      // Create new workflow
      await createWorkflow({
        variables: {
          input: {
            name,
            nodes: cleanNodes,
            edges
          }
        }
      });
    }
  };

  const handleExecute = async (nodes: Node[], edges: Edge[]) => {
    if (!selectedWorkflow) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please save the workflow first"
      });
      return;
    }

    const cleanNodes = nodes.map(cleanNodeForServer);

    await executeWorkflow({
      variables: {
        workflowId: selectedWorkflow,
        nodes: cleanNodes,
        edges
      }
    });
  };

  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className='relative h-screen overflow-hidden'>
      <Header />
      <div className='h-[calc(100vh-4rem)]'>
        <WorkflowCanvas
          onSave={handleSave}
          onExecute={handleExecute}
          isExecuting={executeLoading}
          isSaving={saveLoading || updateLoading}
          currentWorkflowId={selectedWorkflow}
        />
      </div>
      {selectedWorkflow && (
        <div className='absolute bottom-20 right-2 w-1/3 bg-background/80 backdrop-blur-sm border-l overflow-auto z-10'>
          <ExecutionHistory
            workflowId={selectedWorkflow}
            ref={executionHistoryRef}
          />
        </div>
      )}
    </div>
  );
}
