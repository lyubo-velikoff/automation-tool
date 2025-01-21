"use client";

import { useCallback, useState, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  XYPosition,
  ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayIcon } from "lucide-react";
import AddNodeButton from "./AddNodeButton";
import OpenAISettingsDialog from "./OpenAISettingsDialog";
import { ScheduleWorkflowDialog } from "./ScheduleWorkflowDialog";
import { WorkflowSelector } from "./WorkflowSelector";
import { useWorkflowSelection } from "@/hooks/useWorkflowSelection";
import { BasicNode, nodeTypes as defaultNodeTypes } from "./nodeTypes";

interface WorkflowCanvasProps {
  onSave?: (name: string, nodes: Node[], edges: Edge[]) => void;
  onExecute?: (nodes: Node[], edges: Edge[]) => void;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
  isExecuting?: boolean;
  isSaving?: boolean;
  currentWorkflowId?: string | null;
}

interface NodeData {
  // Gmail fields
  to?: string;
  subject?: string;
  body?: string;
  fromFilter?: string;
  subjectFilter?: string;
  pollingInterval?: string | number;

  // OpenAI fields
  prompt?: string;
  model?: string;
  maxTokens?: string | number;

  // Scraping fields
  url?: string;
  selector?: string;
  selectorType?: "css" | "xpath";
  attribute?: string;

  // Common fields
  onConfigChange?: (nodeId: string, data: NodeData) => void;
  label?: string;
}

function WorkflowCanvasInner({
  onSave,
  onExecute,
  onSchedule,
  isExecuting = false,
  isSaving = false,
  currentWorkflowId
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const { selectedWorkflowData } = useWorkflowSelection();

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: NodeData) => {
      console.log("Handling node data change:", { nodeId, newData });
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedNode = {
              ...node,
              data: {
                ...newData,
                onConfigChange: handleNodeDataChange,
                label: newData.label || `${node.type} Node`
              }
            };
            console.log("Updated node:", updatedNode);
            return updatedNode;
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Memoize nodeTypes
  const nodeTypes = useMemo(() => {
    const types = {
      ...defaultNodeTypes,
      GMAIL_ACTION: BasicNode,
      GMAIL_TRIGGER: BasicNode,
      OPENAI: BasicNode,
      SCRAPING: BasicNode,
      default: BasicNode
    };
    console.log("Available node types:", Object.keys(types));
    return types;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log("Node changes:", changes);
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log("Edge changes:", changes);
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleAddNode = useCallback(
    (node: Node) => {
      console.log("handleAddNode called with:", node);
      const position: XYPosition = node.position || { x: 100, y: 100 };
      const nodeWithHandlers = {
        ...node,
        id: node.id || `node-${nodes.length + 1}`,
        type: node.type || "default",
        position,
        data: {
          ...node.data,
          onConfigChange: handleNodeDataChange,
          label: node.data?.label || `${node.type || "Default"} Node`
        }
      };

      console.log("Adding new node with handlers:", nodeWithHandlers);
      setNodes((nds) => {
        console.log("Current nodes before adding:", nds);
        const newNodes = [...nds, nodeWithHandlers];
        console.log("New nodes array after adding:", newNodes);
        return newNodes;
      });
    },
    [nodes, handleNodeDataChange, setNodes]
  );

  const handleSave = () => {
    if (onSave) {
      onSave(workflowName, nodes, edges);
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute(nodes, edges);
    }
  };

  const handleScheduleClick = () => {
    if (onSchedule) {
      onSchedule(nodes, edges);
    }
    setScheduleDialogOpen(true);
  };

  const handleWorkflowSelect = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      console.log("Workflow selected, updating canvas with:", { nodes, edges });
      setNodes(nodes);
      setEdges(edges);
      if (selectedWorkflowData) {
        setWorkflowName(selectedWorkflowData.name);
      }
    },
    [setNodes, setEdges, selectedWorkflowData]
  );

  return (
    <div
      className='flex flex-col w-full h-[calc(100vh-4rem)]'
      data-testid='workflow-canvas'
    >
      <div className='flex-grow relative h-[calc(100%-4rem)]'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
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
          onInit={() => {
            console.log("ReactFlow initialized");
            console.log("Current nodes:", nodes);
            console.log("Current edges:", edges);
          }}
        >
          <Background />
          <Controls className='absolute bottom-4 left-4' />
        </ReactFlow>
      </div>

      <div className='flex items-center gap-4 p-4 border-t bg-background/80 backdrop-blur-sm'>
        <WorkflowSelector onWorkflowSelect={handleWorkflowSelect} />
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder='Enter workflow name'
          className='w-64'
        />
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={handleExecute}
          disabled={isExecuting}
          variant='secondary'
          className='gap-2'
        >
          <PlayIcon className='h-4 w-4' />
          {isExecuting ? "Executing..." : "Test"}
        </Button>
        <Button variant='outline' onClick={handleScheduleClick}>
          Schedule
        </Button>
        <AddNodeButton onAddNode={handleAddNode} />
      </div>
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
