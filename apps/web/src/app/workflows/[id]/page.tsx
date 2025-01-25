"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_WORKFLOW } from "@/graphql/queries";
import WorkflowCanvas from "@/components/workflow/canvas/WorkflowCanvas";
import { WorkflowProvider } from "@/contexts/workflow/WorkflowContext";
import { useWorkflowHandlers } from "@/hooks/useWorkflowHandlers";
import { WorkflowLoadingSkeleton } from "@/components/ui/feedback/loading-skeleton";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import { SidebarLayout } from "@/components/layouts/SidebarLayout";

function WorkflowContent() {
  const params = useParams();
  const workflowId = params.id as string;
  const { setWorkflowState } = useWorkflow();

  const { loading, error, data } = useQuery(GET_WORKFLOW, {
    variables: { id: workflowId },
    skip: !workflowId
  });

  useEffect(() => {
    if (data?.workflow) {
      const { id, name, nodes, edges } = data.workflow;
      setWorkflowState({
        workflowId: id,
        workflowName: name,
        nodes,
        edges
      });
    }
  }, [data, setWorkflowState]);

  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error loading workflow</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.workflow) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Workflow not found</h2>
          <p className="text-sm text-muted-foreground">
            The workflow you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  return <WorkflowCanvas />;
}

export default function WorkflowPage() {
  const { handleSave, handleExecute, handleSchedule } = useWorkflowHandlers();

  return (
    <WorkflowProvider
      onSave={handleSave}
      onExecute={handleExecute}
      onSchedule={handleSchedule}
    >
      <SidebarLayout>
        <WorkflowContent />
      </SidebarLayout>
    </WorkflowProvider>
  );
}
