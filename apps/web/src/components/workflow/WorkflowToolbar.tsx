import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayIcon } from "lucide-react";
import { WorkflowSelector } from "./WorkflowSelector";
import AddNodeButton from "./AddNodeButton";

interface WorkflowToolbarProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onWorkflowSelect: (nodes: Node[], edges: Edge[]) => void;
  onSave: () => void;
  onExecute: () => void;
  onSchedule: () => void;
  onAddNode: (node: Node) => void;
  isSaving?: boolean;
  isExecuting?: boolean;
}

export function WorkflowToolbar({
  workflowName,
  onWorkflowNameChange,
  onWorkflowSelect,
  onSave,
  onExecute,
  onSchedule,
  onAddNode,
  isSaving = false,
  isExecuting = false
}: WorkflowToolbarProps) {
  return (
    <div className='flex items-center gap-4 p-4 border-t bg-background/80 backdrop-blur-sm'>
      <WorkflowSelector onWorkflowSelect={onWorkflowSelect} />
      <Input
        value={workflowName}
        onChange={(e) => onWorkflowNameChange(e.target.value)}
        placeholder='Enter workflow name'
        className='w-64'
      />
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button
        onClick={onExecute}
        disabled={isExecuting}
        variant='secondary'
        className='gap-2'
      >
        <PlayIcon className='h-4 w-4' />
        {isExecuting ? "Executing..." : "Test"}
      </Button>
      <Button variant='outline' onClick={onSchedule}>
        Schedule
      </Button>
      <AddNodeButton onAddNode={onAddNode} />
    </div>
  );
}
