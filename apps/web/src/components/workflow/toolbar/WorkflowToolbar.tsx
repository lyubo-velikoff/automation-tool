"use client";

import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { PlayIcon } from "lucide-react";
import { WorkflowSelector } from "./WorkflowSelector";
import AddNodeButton from "./AddNodeButton";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/feedback/popover";
import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { CREATE_WORKFLOW } from "@/graphql/mutations";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
  onScheduleClick: () => void;
  className?: string;
}

export function WorkflowToolbar({
  onAddNode,
  onScheduleClick,
  className
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
    isExecuting,
    setWorkflowId,
    setWorkflowName
  } = useWorkflow();

  const apolloClient = useApolloClient();
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createWorkflow] = useMutation(CREATE_WORKFLOW);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName) return;

    try {
      // Clean nodes by removing ReactFlow-specific fields and __typename
      const cleanedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: node.data.label,
        position: {
          x: node.position.x,
          y: node.position.y
        },
        data: {
          to: node.data.to,
          subject: node.data.subject,
          body: node.data.body,
          pollingInterval: node.data.pollingInterval,
          fromFilter: node.data.fromFilter,
          subjectFilter: node.data.subjectFilter,
          prompt: node.data.prompt,
          model: node.data.model,
          maxTokens: node.data.maxTokens,
          url: node.data.url,
          selector: node.data.selector,
          selectorType: node.data.selectorType,
          attribute: node.data.attribute,
          label: node.data.label
        }
      }));

      // Clean edges by removing __typename
      const cleanedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      }));

      const { data } = await createWorkflow({
        variables: {
          input: {
            name: newWorkflowName,
            nodes: cleanedNodes,
            edges: cleanedEdges
          }
        }
      });

      // Invalidate and refetch workflows query
      await apolloClient.refetchQueries({
        include: ["GetWorkflows"]
      });

      // Update the selected workflow
      const createdWorkflow = data.createWorkflow;
      setWorkflowId(createdWorkflow.id);
      setWorkflowName(createdWorkflow.name);

      toast({
        title: "Success",
        description: "Workflow created successfully"
      });
      setNewWorkflowName("");
      setIsCreateOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn('flex items-center gap-4 p-4 border bg-background/80 backdrop-blur-sm rounded-lg shadow-lg', className)}>
      <WorkflowSelector />

      {/* Update Existing Workflow */}
      {workflowId && (
        <Button
          onClick={() => handleSave(workflowId, workflowName, nodes, edges)}
          disabled={isSaving}
        >
          {isSaving ? "Updating..." : "Update"}
        </Button>
      )}

      {/* Create New Workflow */}
      <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline'>Create</Button>
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
