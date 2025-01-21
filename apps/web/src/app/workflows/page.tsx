"use client";

import { useState, useRef } from "react";
import { Edge, Node } from "reactflow";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import { useMutation } from "@apollo/client";
import { CREATE_WORKFLOW, EXECUTE_WORKFLOW } from "@/graphql/mutations";
import { useToast } from "@/components/ui/use-toast";
import ExecutionHistory from "@/components/workflow/ExecutionHistory";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/workflow/loading-skeleton";
import { Header } from "@/components/ui/Header";

interface CleanNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export default function WorkflowsPage() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const executionHistoryRef = useRef<{ fetchExecutions: () => Promise<void> }>(
    null
  );
  const { session, loading } = useAuth();

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
      onCompleted: (data) => {
        setCurrentWorkflowId(data.createWorkflow.id);
        toast({
          title: "Success",
          description: "Workflow saved successfully!"
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

    try {
      const { data } = await createWorkflow({
        variables: {
          input: {
            name,
            description: "",
            nodes: nodes.map(cleanNodeForServer),
            edges
          }
        }
      });

      if (!data?.createWorkflow) {
        throw new Error("No data returned from mutation");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  const handleExecute = async () => {
    if (!currentWorkflowId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please save the workflow first"
      });
      return;
    }

    await executeWorkflow({
      variables: { workflowId: currentWorkflowId }
    });
  };

  const handleSchedule = () => {
    if (!currentWorkflowId) {
      toast({
        title: "Error",
        description: "Please save the workflow first",
        variant: "destructive"
      });
      return;
    }
  };

  // Show loading skeleton while checking auth
  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  // If not authenticated, don't render anything (will be redirected)
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
          onSchedule={handleSchedule}
          isExecuting={executeLoading}
          isSaving={saveLoading}
          currentWorkflowId={currentWorkflowId}
        />
      </div>

      {/* Execution history overlay on the right */}
      {currentWorkflowId && (
        <div className='absolute top-16 right-0 bottom-0 w-80 bg-background/80 backdrop-blur-sm border-l overflow-auto z-10'>
          <ExecutionHistory
            ref={executionHistoryRef}
            workflowId={currentWorkflowId}
          />
        </div>
      )}
    </div>
  );
}
