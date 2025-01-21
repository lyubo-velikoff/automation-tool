"use client";

import { useCallback } from "react";
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
  NodeProps
} from "reactflow";
import "reactflow/dist/style.css";
import NodeSelector from "./NodeSelector";
import { ScrapingNode } from "./nodes/ScrapingNode";

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

// Memoized node components
const BasicNode = (props: NodeProps) => (
  <div
    className='bg-white rounded-lg shadow-lg border border-gray-200 p-4'
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
      className='bg-white rounded-lg shadow-lg border border-gray-200'
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
}

// Helper function to clean up edge data
const cleanEdgeData = (edge: Edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle,
  targetHandle: edge.targetHandle
});

export default function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      if (onSave) {
        onSave(nodes, edges);
      }
    },
    [setNodes, nodes, edges, onSave]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      if (onSave) {
        onSave(nodes, edges);
      }
    },
    [setEdges, nodes, edges, onSave]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      if (onSave) {
        const updatedNodes = nodes.map((node) => ({
          ...node,
          position: {
            x: Math.max(0, node.position.x),
            y: Math.max(0, node.position.y)
          }
        }));
        onSave(updatedNodes, edges.map(cleanEdgeData));
      }
    },
    [onNodesChange, onSave, nodes, edges]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (onSave) {
        onSave(nodes, edges.map(cleanEdgeData));
      }
    },
    [onEdgesChange, onSave, nodes, edges]
  );

  return (
    <div className='w-full h-full' data-testid='workflow-canvas'>
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
          // animated: true,
          // style: { stroke: "#64748b", strokeWidth: 2 }
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
  );
}
