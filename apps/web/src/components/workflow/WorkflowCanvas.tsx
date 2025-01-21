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

interface WorkflowCanvasProps {
  onSave?: (name: string, nodes: Node[], edges: Edge[]) => void;
  onExecute?: (nodes: Node[], edges: Edge[]) => void;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
  isExecuting?: boolean;
  isSaving?: boolean;
  currentWorkflowId?: string | null;
}

function WorkflowCanvasInner({
  onSave,
  onExecute,
  onSchedule,
  isExecuting = false,
  isSaving = false,
  currentWorkflowId
}: WorkflowCanvasProps) {
  const [workflowName, setWorkflowName] = useState("");
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleAddNode,
    handleWorkflowSelect
  } = useNodeManagement({
    onSave: onSave
      ? (name, nodes, edges) => onSave(name, nodes, edges)
      : undefined,
    onExecute: onExecute
      ? (nodes, edges) => onExecute(nodes, edges)
      : undefined,
    onSchedule: onSchedule
      ? (nodes, edges) => onSchedule(nodes, edges)
      : undefined
  });

  const handleWorkflowNameChange = (name: string) => {
    setWorkflowName(name);
  };

  const handleScheduleClick = () => {
    if (onSchedule) onSchedule(nodes, edges);
    setScheduleDialogOpen(true);
  };

  return (
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

      <WorkflowToolbar
        workflowName={workflowName}
        onWorkflowNameChange={handleWorkflowNameChange}
        onWorkflowSelect={handleWorkflowSelect}
        onSave={() => onSave?.(workflowName, nodes, edges)}
        onExecute={() => onExecute?.(nodes, edges)}
        onSchedule={handleScheduleClick}
        onAddNode={handleAddNode}
        isSaving={isSaving}
        isExecuting={isExecuting}
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
      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
      />
    </div>
  );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
