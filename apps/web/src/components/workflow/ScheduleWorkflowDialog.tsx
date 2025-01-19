import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { START_TIMED_WORKFLOW, STOP_TIMED_WORKFLOW } from '../../graphql/mutations';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../ui/use-toast';
import { WorkflowNode, WorkflowEdge } from '../../types/workflow';

interface ScheduleWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export function ScheduleWorkflowDialog({
  open,
  onOpenChange,
  workflowId,
  nodes,
  edges,
}: ScheduleWorkflowDialogProps) {
  const [intervalMinutes, setIntervalMinutes] = useState('15');
  const [isScheduled, setIsScheduled] = useState(false);

  const [startWorkflow] = useMutation(START_TIMED_WORKFLOW, {
    onCompleted: () => {
      toast({
        title: 'Workflow Scheduled',
        description: `Workflow will run every ${intervalMinutes} minutes`,
      });
      setIsScheduled(true);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [stopWorkflow] = useMutation(STOP_TIMED_WORKFLOW, {
    onCompleted: () => {
      toast({
        title: 'Workflow Stopped',
        description: 'The scheduled workflow has been stopped',
      });
      setIsScheduled(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSchedule = async () => {
    const minutes = parseInt(intervalMinutes, 10);
    if (isNaN(minutes) || minutes < 1) {
      toast({
        title: 'Invalid Interval',
        description: 'Please enter a valid number of minutes (minimum 1)',
        variant: 'destructive',
      });
      return;
    }

    // Restructure nodes to match backend schema
    const formattedNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.data.label || 'Untitled Node',
      position: node.position,
      data: {
        ...node.data,
        label: undefined // Remove label from data since it's now at root level
      }
    }));

    await startWorkflow({
      variables: {
        workflowId,
        nodes: formattedNodes,
        edges,
        intervalMinutes: minutes,
      },
    });
  };

  const handleStop = async () => {
    await stopWorkflow({
      variables: {
        workflowId,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Workflow</DialogTitle>
          <DialogDescription>
            Set up automatic execution of your workflow at regular intervals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interval" className="col-span-2">
              Run every (minutes)
            </Label>
            <Input
              id="interval"
              type="number"
              min="1"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
              className="col-span-2"
              disabled={isScheduled}
            />
          </div>
        </div>
        <DialogFooter>
          {!isScheduled ? (
            <Button onClick={handleSchedule}>Schedule</Button>
          ) : (
            <Button onClick={handleStop} variant="destructive">
              Stop Schedule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
