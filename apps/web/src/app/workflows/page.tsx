"use client";

import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/workflow/loading-skeleton";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { Header } from "@/components/ui/Header";
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
