"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayIcon } from "lucide-react";
import { WorkflowSelector } from "./WorkflowSelector";
import AddNodeButton from "./AddNodeButton";
import { useWorkflow } from "@/contexts/WorkflowContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useState } from "react";

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
  onScheduleClick: () => void;
}

export function WorkflowToolbar({
  onAddNode,
  onScheduleClick
}: WorkflowToolbarProps) {
  const {
    workflowId,
    workflowName,
    nodes,
    edges,
    handleSave,
    handleExecute,
    handleSchedule,
    isSaving,
    isExecuting
  } = useWorkflow();

  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateWorkflow = () => {
    if (!newWorkflowName) return;
    handleSave(newWorkflowName, nodes, edges);
    setNewWorkflowName("");
    setIsCreateOpen(false);
  };

  return (
    <div className='flex items-center gap-4 p-4 border-t bg-background/80 backdrop-blur-sm'>
      <WorkflowSelector />

      {/* Create New Workflow */}
      <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline'>Create New</Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'>
          <div className='flex flex-col gap-4'>
            <div className='flex gap-2'>
              <Input
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder='Enter workflow name'
                className='flex-grow'
              />
              <Button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName || isSaving}
              >
                Create
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Update Existing Workflow */}
      {workflowId && (
        <Button
          onClick={() => handleSave(workflowName, nodes, edges)}
          disabled={isSaving}
        >
          {isSaving ? "Updating..." : "Update"}
        </Button>
      )}

      <Button
        onClick={() => workflowId && handleExecute(workflowId)}
        disabled={isExecuting || !workflowId}
        variant='secondary'
        className='gap-2'
      >
        <PlayIcon className='h-4 w-4' />
        {isExecuting ? "Executing..." : "Test"}
      </Button>
      <Button
        variant='outline'
        onClick={() => {
          handleSchedule(nodes, edges);
          onScheduleClick();
        }}
        disabled={!workflowId}
      >
        Schedule
      </Button>
      <AddNodeButton onAddNode={onAddNode} />
    </div>
  );
}
