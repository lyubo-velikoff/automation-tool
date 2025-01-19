'use client';

import { useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeSelector from './NodeSelector';
import AddNodeButton from './AddNodeButton';

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const nodeTypes = {
  gmailTrigger: NodeSelector,
  gmailAction: NodeSelector,
  openaiCompletion: NodeSelector,
};

interface NodeData {
  to?: string;
  subject?: string;
  body?: string;
  fromFilter?: string;
  subjectFilter?: string;
  pollingInterval?: string | number;
  prompt?: string;
  model?: string;
  maxTokens?: string | number;
  onConfigChange?: (nodeId: string, data: NodeData) => void;
}

export default function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeDataChange = useCallback((nodeId: string, newData: NodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...newData,
              onConfigChange: handleNodeDataChange,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleAddNode = useCallback((node: Node) => {
    node.data = {
      ...node.data,
      onConfigChange: handleNodeDataChange,
    };
    setNodes((nds) => [...nds, node]);
  }, [setNodes, handleNodeDataChange]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [onNodesChange, onSave, nodes, edges]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [onEdgesChange, onSave, nodes, edges]);

  return (
    <div className="h-full">
      <div className="absolute top-4 left-4 z-10">
        <AddNodeButton onAddNode={handleAddNode} />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
} 
