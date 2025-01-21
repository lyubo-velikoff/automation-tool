"use client";

import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import { useMutation } from "@apollo/client";
import {
  CREATE_WORKFLOW,
  EXECUTE_WORKFLOW,
  UPDATE_WORKFLOW
} from "@/graphql/mutations";
import { useToast } from "@/components/ui/use-toast";
import { ExecutionHistory } from "@/components/workflow/ExecutionHistory";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/workflow/loading-skeleton";
import { WorkflowProvider, useWorkflow } from "@/contexts/WorkflowContext";
import { Header } from "@/components/ui/Header";
import { Node, Edge } from "reactflow";

interface CleanNode extends Omit<Node, "data"> {
  data: Record<string, unknown>;
}

function WorkflowsPageContent() {
  const { toast } = useToast();
  const { session, loading } = useAuth();
  const { workflowId } = useWorkflow();

  const [createWorkflow] = useMutation(CREATE_WORKFLOW);
  const [updateWorkflow] = useMutation(UPDATE_WORKFLOW);
  const [executeWorkflow] = useMutation(EXECUTE_WORKFLOW);

  const cleanNodeForServer = (node: Node): CleanNode => {
    const { data, ...rest } = node;
    return {
      ...rest,
      data: {
        ...data,
        onConfigChange: undefined
      }
    };
  };

  const handleSave = async (name: string, nodes: Node[], edges: Edge[]) => {
    const cleanNodes = nodes.map(cleanNodeForServer);

    if (workflowId) {
      // Update existing workflow
      await updateWorkflow({
        variables: {
          id: workflowId,
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
    if (!workflowId) {
      toast({
        variant: "destructive",
        title: "No workflow selected",
        description: "Please select a workflow to execute"
      });
      return;
    }

    const cleanNodes = nodes.map(cleanNodeForServer);

    await executeWorkflow({
      variables: {
        workflowId,
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
    <div className='relative h-screen'>
      <Header />
      <div className='h-[calc(100vh-4rem)]'>
        <WorkflowCanvas onSave={handleSave} onExecute={handleExecute} />
      </div>
      {workflowId && (
        <div className='absolute bottom-20 right-2 w-1/3 bg-background/80 backdrop-blur-sm border-l overflow-auto z-10'>
          <ExecutionHistory
            history={[]}
            currentExecution={null}
            className='mx-4 mb-4'
          />
        </div>
      )}
    </div>
  );
}

export default function WorkflowsPage() {
  return (
    <WorkflowProvider>
      <WorkflowsPageContent />
    </WorkflowProvider>
  );
}
