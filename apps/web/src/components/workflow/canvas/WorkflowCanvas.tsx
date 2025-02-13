"use client";

import { useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";
import { ScheduleWorkflowDialog } from "../toolbar/ScheduleWorkflowDialog";
import { useNodeManagement } from "@/hooks/workflow/useNodeManagement";
import { NODE_TYPES } from "../config/nodeTypes";
import { WorkflowToolbar } from "../toolbar/WorkflowToolbar";
import { ExecutionHistory } from "../toolbar/ExecutionHistory";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";

interface WorkflowCanvasProps {
  onSave?: (
    workflowId: string,
    name: string,
    nodes: Node[],
    edges: Edge[]
  ) => Promise<void>;
  onExecute?: (workflowId: string) => Promise<void>;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
}

function WorkflowCanvas({
  onSave,
  onExecute,
  onSchedule
}: WorkflowCanvasProps) {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleAddNode
  } = useNodeManagement();

  const { workflowId } = useWorkflow();
  const { executionHistory, currentExecution } = useWorkflowExecution({
    onExecute
  });

  return (
    <ReactFlowProvider>
      <div
        className='relative w-full h-screen'
        data-testid='workflow-canvas'
      >
        <WorkflowToolbar
          onAddNode={handleAddNode}
          onScheduleClick={() => {
            if (onSchedule) {
              onSchedule(nodes, edges);
            }
            setScheduleDialogOpen(true);
          }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-auto"
        />
        <div className='h-full'>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            defaultEdgeOptions={{
              className: "workflow-edge",
              type: "smoothstep"
            }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={4}
            fitView
            className='h-full w-full'
            snapToGrid
            snapGrid={[15, 15]}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls 
              className='absolute bottom-0 right-0 !m-0 flex flex-row !bg-background/80 backdrop-blur-sm scale-100 shadow-lg z-40'
              showInteractive={false}
              position="bottom-right"
            />
          </ReactFlow>
        </div>

        {workflowId && (
          <ExecutionHistory
            history={executionHistory}
            currentExecution={currentExecution}
            className='absolute bottom-4 right-4 z-50'
          />
        )}

        <ScheduleWorkflowDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default WorkflowCanvas;
