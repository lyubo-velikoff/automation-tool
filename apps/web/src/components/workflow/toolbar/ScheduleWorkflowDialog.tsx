import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { START_TIMED_WORKFLOW, STOP_TIMED_WORKFLOW } from "@/graphql/mutations";
import { IS_WORKFLOW_SCHEDULED } from "@/graphql/queries";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/layout/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { toast } from "@/hooks/use-toast";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";

interface ScheduleWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleWorkflowDialog({
  open,
  onOpenChange
}: ScheduleWorkflowDialogProps) {
  const { workflowId, nodes, edges } = useWorkflow();
  const [intervalMinutes, setIntervalMinutes] = useState("15");

  // Query to check if workflow is scheduled, only when dialog is opened
  const {
    data: scheduleData,
    loading: scheduleLoading,
    refetch
  } = useQuery(IS_WORKFLOW_SCHEDULED, {
    variables: { workflowId },
    skip: !workflowId || !open,
    fetchPolicy: "network-only" // Always fetch fresh data when opened
  });

  const [startWorkflow] = useMutation(START_TIMED_WORKFLOW, {
    onCompleted: () => {
      toast({
        title: "Workflow Scheduled",
        description: `Workflow will run every ${intervalMinutes} minutes`
      });
      refetch(); // Refetch status after scheduling
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const [stopWorkflow] = useMutation(STOP_TIMED_WORKFLOW, {
    onCompleted: () => {
      toast({
        title: "Workflow Stopped",
        description: "The scheduled workflow has been stopped"
      });
      refetch(); // Refetch status after stopping
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSchedule = async () => {
    const minutes = parseInt(intervalMinutes, 10);
    if (isNaN(minutes) || minutes < 1) {
      toast({
        title: "Invalid Interval",
        description: "Please enter a valid number of minutes (minimum 1)",
        variant: "destructive"
      });
      return;
    }

    // Clean nodes by removing __typename and restructuring
    const formattedNodes = nodes.map((node) => {
      const { data, position, ...rest } = node;
      const cleanedData = { ...data };
      delete cleanedData.__typename;

      return {
        ...rest,
        label: data.label || "Untitled Node",
        position: {
          x: position.x,
          y: position.y
        },
        data: cleanedData
      };
    });

    // Clean edges by removing __typename
    const formattedEdges = edges.map(({ __typename, ...edge }) => edge);

    await startWorkflow({
      variables: {
        workflowId,
        nodes: formattedNodes,
        edges: formattedEdges,
        intervalMinutes: minutes
      }
    });
  };

  const handleStop = async () => {
    await stopWorkflow({
      variables: {
        workflowId
      }
    });
  };

  if (!workflowId) return null;

  const isScheduled = scheduleData?.isWorkflowScheduled;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          refetch(); // Refetch status when dialog is opened
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Workflow</DialogTitle>
          <DialogDescription>
            Set up automatic execution of your workflow at regular intervals.
            {scheduleLoading && " (Checking status...)"}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='interval' className='col-span-2'>
              Run every (minutes)
            </Label>
            <Input
              id='interval'
              type='number'
              min='1'
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
              className='col-span-2'
              disabled={isScheduled}
            />
          </div>
          {isScheduled && (
            <div className='text-sm text-muted-foreground'>
              This workflow is currently scheduled and running.
            </div>
          )}
        </div>
        <DialogFooter>
          {!isScheduled ? (
            <Button onClick={handleSchedule}>Schedule</Button>
          ) : (
            <Button onClick={handleStop} variant='destructive'>
              Stop Schedule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
