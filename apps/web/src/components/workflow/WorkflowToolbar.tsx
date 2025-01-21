"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayIcon } from "lucide-react";
import { WorkflowSelector } from "./WorkflowSelector";
import AddNodeButton from "./AddNodeButton";
import { useWorkflow } from "@/contexts/WorkflowContext";

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
}

export function WorkflowToolbar({
  onAddNode,
}: WorkflowToolbarProps) {
  const {
    workflowName,
    nodes,
    edges,
    setWorkflowName,
    handleSave,
    handleExecute,
    handleSchedule,
    isSaving,
    isExecuting,
  } = useWorkflow();

  return (
    <div className='flex items-center gap-4 p-4 border-t bg-background/80 backdrop-blur-sm'>
      <WorkflowSelector />
      <Input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        placeholder='Enter workflow name'
        className='w-64'
      />
      <Button
        onClick={() => handleSave(workflowName, nodes, edges)}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button
        onClick={() => handleExecute(nodes, edges)}
        disabled={isExecuting}
        variant='secondary'
        className='gap-2'
      >
        <PlayIcon className='h-4 w-4' />
        {isExecuting ? "Executing..." : "Test"}
      </Button>
      <Button variant='outline' onClick={() => handleSchedule(nodes, edges)}>
        Schedule
      </Button>
      <AddNodeButton onAddNode={onAddNode} />
    </div>
  );
}
