"use client";

import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import { useMutation } from "@apollo/client";
import { EXECUTE_WORKFLOW, UPDATE_WORKFLOW } from "@/graphql/mutations";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/workflow/loading-skeleton";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { Header } from "@/components/ui/Header";
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

function useWorkflowHandlers() {
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
      console.error("Failed to save workflow:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "An error occurred"
      });
    }
  };

  const handleExecute = async (nodes: Node[], edges: Edge[]) => {
    console.log("handleExecute called with:", { nodes, edges });

    try {
      const cleanNodes = nodes.map(cleanNodeForServer);
      console.log("Executing workflow with:", { cleanNodes, edges });

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
      console.error("Workflow execution failed:", error);
      toast({
        variant: "destructive",
        title: "Execution failed",
        description:
          error instanceof Error ? error.message : "An error occurred"
      });
    }
  };

  return { handleSave, handleExecute };
}

function WorkflowsPageContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <div className='flex-grow'>
        <WorkflowCanvas />
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const { handleSave, handleExecute } = useWorkflowHandlers();

  return (
    <WorkflowProvider onSave={handleSave} onExecute={handleExecute}>
      <WorkflowsPageContent />
    </WorkflowProvider>
  );
}
