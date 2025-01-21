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
import OpenAISettingsDialog from "./OpenAISettingsDialog";
import { ScheduleWorkflowDialog } from "./ScheduleWorkflowDialog";
import { useNodeManagement } from "@/hooks/useNodeManagement";
import { NODE_TYPES } from "./config/nodeTypes";
import { WorkflowToolbar } from "./WorkflowToolbar";
import { ExecutionHistory } from "./ExecutionHistory";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { useWorkflow } from "@/contexts/WorkflowContext";

interface WorkflowCanvasProps {
  onSave?: (name: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  onExecute?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
}

function WorkflowCanvas({
  onSave,
  onExecute,
  onSchedule
}: WorkflowCanvasProps) {
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const { nodes, edges } = useNodeManagement();
  const { workflowId } = useWorkflow();
  const { executionHistory, currentExecution } = useWorkflowExecution({
    onExecute
  });

  const { onNodesChange, onEdgesChange, onConnect, handleAddNode } =
    useNodeManagement();

  return (
    <ReactFlowProvider>
      <div
        className='flex flex-col w-full h-[calc(100vh-4rem)]'
        data-testid='workflow-canvas'
      >
        <div className='flex-grow relative h-[calc(100%-4rem)]'>
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
            className='h-full'
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background />
            <Controls className='absolute bottom-4 left-4' />
          </ReactFlow>
        </div>

        <div className='flex flex-col gap-4'>
          <WorkflowToolbar onAddNode={handleAddNode} />
          {workflowId && (
            <ExecutionHistory
              history={executionHistory}
              currentExecution={currentExecution}
              className='mx-4 mb-4'
            />
          )}
        </div>

        <ScheduleWorkflowDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
        />
        <OpenAISettingsDialog
          open={openAISettingsOpen}
          onOpenChange={setOpenAISettingsOpen}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default WorkflowCanvas;
