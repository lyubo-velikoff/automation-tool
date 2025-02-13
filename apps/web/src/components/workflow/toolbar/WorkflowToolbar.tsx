"use client";

import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { PlayIcon, Tag, Save } from "lucide-react";
import { WorkflowSelector } from "./WorkflowSelector";
import AddNodeButton from "./AddNodeButton";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/feedback/popover";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { CREATE_WORKFLOW } from "@/graphql/mutations";
import { GET_WORKFLOW_TAGS } from "@/graphql/queries";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/overlays/dropdown-menu";
import { Label } from "@/components/ui/inputs/label";
import { useRouter } from "next/navigation";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { ExecutionHistory } from "./ExecutionHistory";

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
  onScheduleClick: () => void;
  className?: string;
}

interface SavedState {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function WorkflowToolbar({
  onAddNode,
  onScheduleClick,
  className
}: WorkflowToolbarProps) {
  const router = useRouter();
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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<SavedState>({ nodes: [], edges: [] });
  const apolloClient = useApolloClient();
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createWorkflow] = useMutation(CREATE_WORKFLOW);
  const { data: tagsData } = useQuery(GET_WORKFLOW_TAGS);

  // More efficient change detection
  const hasChangedSignificantly = useCallback((
    current: { nodes: Node<NodeData>[]; edges: Edge[] },
    saved: SavedState
  ) => {
    // Only check relevant properties to avoid unnecessary saves
    const simplifyNode = (node: Node<NodeData>) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data?.label,
        to: node.data?.to,
        subject: node.data?.subject,
        body: node.data?.body,
        pollingInterval: node.data?.pollingInterval,
        fromFilter: node.data?.fromFilter,
        subjectFilter: node.data?.subjectFilter,
        prompt: node.data?.prompt,
        model: node.data?.model,
        maxTokens: node.data?.maxTokens,
        url: node.data?.url,
        selectors: node.data?.selectors
      }
    });

    const simplifyEdge = (edge: Edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    });

    const currentSimplified = {
      nodes: current.nodes.map(simplifyNode),
      edges: current.edges.map(simplifyEdge)
    };

    const savedSimplified = {
      nodes: saved.nodes.map(simplifyNode),
      edges: saved.edges.map(simplifyEdge)
    };

    return JSON.stringify(currentSimplified) !== JSON.stringify(savedSimplified);
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    if (!workflowId) return;
    
    const hasChanges = hasChangedSignificantly({ nodes, edges }, lastSavedState);
    setHasUnsavedChanges(hasChanges);
  }, [nodes, edges, lastSavedState, workflowId, hasChangedSignificantly]);

  const handleManualSave = async () => {
    if (!workflowId) return;
    
    try {
      await handleSave(workflowId, workflowName, nodes, edges);
      setLastSavedState({ nodes, edges });
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Workflow saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive"
      });
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName) return;

    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm(
        "You have unsaved changes in the current workflow. Do you want to proceed without saving?"
      );
      if (!confirmNavigation) return;
    }

    try {
      const { data } = await createWorkflow({
        variables: {
          input: {
            name: newWorkflowName,
            nodes: [],
            edges: [],
            tag_ids: selectedTags
          }
        }
      });

      await apolloClient.refetchQueries({
        include: ["GetWorkflows"]
      });

      const createdWorkflow = data.createWorkflow;
      setWorkflowId(createdWorkflow.id);
      setWorkflowName(createdWorkflow.name);
      setLastSavedState({ nodes: [], edges: [] });
      setHasUnsavedChanges(false);

      router.push(`/workflows/${createdWorkflow.id}`);

      toast({
        title: "Success",
        description: "Workflow created successfully"
      });
      setNewWorkflowName("");
      setSelectedTags([]);
      setIsCreateOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn('flex items-center gap-4 p-4 border bg-background/80 backdrop-blur-sm rounded-lg shadow-lg', className)}>
      <WorkflowSelector />

      {/* Save/Update Button */}
      {workflowId && (
        <Button
          onClick={handleManualSave}
          disabled={isSaving || !hasUnsavedChanges}
          variant={hasUnsavedChanges ? "default" : "outline"}
          className="gap-2"
        >
          <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
          {isSaving ? "Saving..." : hasUnsavedChanges ? "Save*" : "Saved"}
        </Button>
      )}

      {/* Create New Workflow */}
      <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline'>Create</Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'>
          <div className='flex flex-col gap-4'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Name</Label>
                <Input
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder='Enter workflow name'
                />
              </div>
              <div className='space-y-2'>
                <Label>Tags</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        selectedTags.length === 0 && "text-muted-foreground"
                      )}
                    >
                      <Tag className='mr-2 h-4 w-4' />
                      {selectedTags.length > 0
                        ? `${selectedTags.length} tag${
                            selectedTags.length === 1 ? "" : "s"
                          } selected`
                        : "Select tags"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-[200px]'>
                    {tagsData?.workflowTags?.map((tag: { id: string; name: string; color: string }) => (
                      <DropdownMenuCheckboxItem
                        key={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedTags(
                            checked
                              ? [...selectedTags, tag.id]
                              : selectedTags.filter((id) => id !== tag.id)
                          );
                        }}
                      >
                        <div className='flex items-center'>
                          <div
                            className='w-2 h-2 rounded-full mr-2'
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName || isSaving}
                className='w-full'
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

      {workflowId && <ExecutionHistory />}

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
