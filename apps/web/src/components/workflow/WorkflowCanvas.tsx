'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import GmailTriggerNode from './nodes/gmail/GmailTriggerNode';
import GmailActionNode from './nodes/gmail/GmailActionNode';
import NodeSelector from './NodeSelector';

// Define custom node types
const nodeTypes = {
  gmailTrigger: GmailTriggerNode,
  gmailAction: GmailActionNode,
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

export default function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
  readOnly = false,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      if (onSave) {
        onSave(nodes, edges);
      }
    },
    [nodes, edges, onNodesChange, onSave],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (onSave) {
        onSave(nodes, edges);
      }
    },
    [nodes, edges, onEdgesChange, onSave],
  );

  const handleAddNode = useCallback(
    (newNode: Node) => {
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-background">
      <div className="absolute top-4 left-4 z-10">
        <NodeSelector onAddNode={handleAddNode} />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
} 
