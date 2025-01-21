"use client";

import { useCallback, useState } from "react";
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
  NodeProps,
  XYPosition
} from "reactflow";
import "reactflow/dist/style.css";
import NodeSelector from "./NodeSelector";
import { ScrapingNode } from "./nodes/ScrapingNode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayIcon } from "lucide-react";
import AddNodeButton from "./AddNodeButton";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  onSave?: (name: string, nodes: Node[], edges: Edge[]) => void;
  onExecute?: (nodes: Node[], edges: Edge[]) => void;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
  isExecuting?: boolean;
  isSaving?: boolean;
}

// Memoized node components
const BasicNode = (props: NodeProps) => (
  <div
    className={cn(
      "rounded-lg shadow-lg border p-4",
      "bg-background text-foreground"
    )}
    data-testid={`node-${props.type.toLowerCase()}`}
  >
    <NodeSelector {...props} />
  </div>
);

// Define nodeTypes outside the component
const nodeTypes = {
  GMAIL_TRIGGER: BasicNode,
  GMAIL_ACTION: BasicNode,
  OPENAI: BasicNode,
  SCRAPING: (props: NodeProps) => (
    <div
      className={cn(
        "rounded-lg shadow-lg border",
        "bg-background text-foreground"
      )}
      data-testid={`node-${props.type.toLowerCase()}`}
    >
      <ScrapingNode
        {...props}
        id={props.id}
        data={{
          ...props.data,
          onConfigChange: (nodeId: string, data: NodeData) => {
            if (props.data.onConfigChange) {
              props.data.onConfigChange(nodeId, data);
            }
          }
        }}
      />
    </div>
  )
};

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

export default function WorkflowCanvas({
  onSave,
  onExecute,
  onSchedule,
  isExecuting = false,
  isSaving = false
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("");

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
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleAddNode = useCallback(
    (node: Node) => {
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

      setNodes((nds) => [...nds, nodeWithHandlers]);
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

  const handleSchedule = () => {
    if (onSchedule) {
      onSchedule(nodes, edges);
    }
  };

  return (
    <div className='flex flex-col w-full h-full' data-testid='workflow-canvas'>
      <div className='flex-grow relative'>
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
        >
          <Background />
          <Controls className='absolute bottom-4 left-4' />
        </ReactFlow>
      </div>

      <div className='flex items-center gap-4 p-4 border-t bg-background/80 backdrop-blur-sm'>
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
        <Button variant='outline' onClick={handleSchedule}>
          Schedule
        </Button>
        <AddNodeButton onAddNode={handleAddNode} />
      </div>
    </div>
  );
}
