"use client";

import WorkflowCanvas from "@/components/workflow/canvas/WorkflowCanvas";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/ui/feedback/loading-skeleton";
import { WorkflowProvider } from "@/contexts/workflow/WorkflowContext";
import { Header } from "@/components/ui/navigation/Header";
import { useWorkflowHandlers } from "@/hooks/useWorkflowHandlers";

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
  const { handleSave, handleExecute, handleSchedule } = useWorkflowHandlers();

  return (
    <WorkflowProvider
      onSave={handleSave}
      onExecute={handleExecute}
      onSchedule={handleSchedule}
    >
      <WorkflowsPageContent />
    </WorkflowProvider>
  );
}
