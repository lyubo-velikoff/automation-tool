"use client";

import { useState, useRef, useCallback } from "react";
import { Edge, XYPosition } from "reactflow";
import type { Node } from "reactflow";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import OpenAISettingsDialog from "@/components/workflow/OpenAISettingsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import { CREATE_WORKFLOW, EXECUTE_WORKFLOW } from "@/graphql/mutations";
import { PlayIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ExecutionHistory from "@/components/workflow/ExecutionHistory";
import { useAuth } from "@/hooks/useAuth";
import { WorkflowLoadingSkeleton } from "@/components/workflow/loading-skeleton";
import { Header } from "@/components/ui/Header";
import AddNodeButton from "@/components/workflow/AddNodeButton";
import { ScheduleWorkflowDialog } from "@/components/workflow/ScheduleWorkflowDialog";

interface NodeData {
  label?: string;
  onConfigChange?: (nodeId: string, data: NodeData) => void;
  url?: string;
  selector?: string;
  selectorType?: "css" | "xpath";
  attribute?: string;
  results?: unknown;
}

interface CleanNode {
  id: string;
  type: string;
  label: string;
  position: XYPosition;
  data: Record<string, unknown>;
}

export default function WorkflowsPage() {
  const [workflowName, setWorkflowName] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const executionHistoryRef = useRef<{ fetchExecutions: () => Promise<void> }>(
    null
  );
  const { session, loading } = useAuth();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: NodeData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...newData,
                onConfigChange: handleNodeDataChange
              }
            };
          }
          return node;
        })
      );
    },
    []
  );

  const [createWorkflow, { loading: saveLoading }] = useMutation(
    CREATE_WORKFLOW,
    {
      onError: (error) => {
        console.error("GraphQL error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save workflow"
        });
      },
      onCompleted: (data) => {
        setCurrentWorkflowId(data.createWorkflow.id);
        toast({
          title: "Success",
          description: "Workflow saved successfully!"
        });
      }
    }
  );

  const [executeWorkflow, { loading: executeLoading }] = useMutation(
    EXECUTE_WORKFLOW,
    {
      onError: (error) => {
        console.error("Execution error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to execute workflow"
        });
      },
      onCompleted: async (data) => {
        if (data.executeWorkflow.success) {
          // Update nodes with execution results
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              const nodeResults = data.executeWorkflow.results?.[node.id];
              if (nodeResults && node.type === "SCRAPING") {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    results: nodeResults.results
                  }
                };
              }
              return node;
            })
          );

          toast({
            title: "Success",
            description:
              data.executeWorkflow.message || "Workflow executed successfully!"
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              data.executeWorkflow.message || "Failed to execute workflow"
          });
        }

        // Always fetch executions, regardless of success or failure
        await executionHistoryRef.current?.fetchExecutions();
      }
    }
  );

  const cleanNodeForServer = (node: Node): CleanNode => {
    const cleanData = { ...node.data };
    delete cleanData.onConfigChange;

    return {
      id: node.id,
      type: node.type || "default",
      label: node.data?.label || "Untitled Node",
      position: node.position,
      data: cleanData
    };
  };

  const handleSave = async () => {
    if (!workflowName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a workflow name"
      });
      return;
    }

    try {
      const { data } = await createWorkflow({
        variables: {
          input: {
            name: workflowName,
            description: "",
            nodes: nodes.map(cleanNodeForServer),
            edges
          }
        }
      });

      if (!data?.createWorkflow) {
        throw new Error("No data returned from mutation");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  const handleExecute = async () => {
    if (!currentWorkflowId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please save the workflow first"
      });
      return;
    }

    await executeWorkflow({
      variables: { workflowId: currentWorkflowId }
    });
  };

  const handleCanvasChange = (updatedNodes: Node[], updatedEdges: Edge[]) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  const handleAddNode = useCallback(
    (node: Node) => {
      const defaultData =
        node.type === "SCRAPING"
          ? {
              url: "",
              selector: "",
              selectorType: "css" as const,
              attribute: ""
            }
          : {};

      node.data = {
        ...defaultData,
        ...node.data,
        onConfigChange: handleNodeDataChange
      };
      setNodes((nds) => [...nds, node]);
    },
    [handleNodeDataChange]
  );

  // Show loading skeleton while checking auth
  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  // If not authenticated, don't render anything (will be redirected)
  if (!session) {
    return null;
  }

  return (
    <div className='relative h-screen overflow-hidden'>
      {/* Full screen canvas */}
      <div className='absolute inset-0'>
        <Header />
        <WorkflowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onSave={handleCanvasChange}
          onAddNode={handleAddNode}
        />
      </div>
      {/* Overlay controls at the top */}
      <div className='absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-10'>
        <div className='flex justify-center items-center gap-4 p-4'>
          <div className='flex justify-center items-center gap-2'>
            <Input
              id='workflow-name'
              value={workflowName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWorkflowName(e.target.value)
              }
              placeholder='Enter workflow name'
              className='w-64'
            />
          </div>
          <Button onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleExecute}
            disabled={executeLoading || !currentWorkflowId}
            variant='secondary'
            className='gap-2'
          >
            <PlayIcon className='h-4 w-4' />
            {executeLoading ? "Executing..." : "Test"}
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              if (!currentWorkflowId) {
                toast({
                  title: "Error",
                  description: "Please save the workflow first",
                  variant: "destructive"
                });
                return;
              }
              setScheduleDialogOpen(true);
            }}
          >
            Schedule
          </Button>
          <AddNodeButton onAddNode={handleAddNode} />
        </div>

        {/* Execution history overlay on the right */}
        {currentWorkflowId && (
          <div className='bg-background/80 backdrop-blur-sm border-l overflow-auto z-10'>
            <ExecutionHistory
              ref={executionHistoryRef}
              workflowId={currentWorkflowId}
            />
          </div>
        )}
      </div>

      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {currentWorkflowId && (
        <ScheduleWorkflowDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          workflowId={currentWorkflowId}
          nodes={nodes}
          edges={edges}
        />
      )}
    </div>
  );
}
