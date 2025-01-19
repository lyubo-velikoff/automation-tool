'use client';

import { useCallback, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeSelector from './NodeSelector';
import AddNodeButton from './AddNodeButton';
import { ScrapingNode } from './nodes/ScrapingNode';
import { ScheduleWorkflowDialog } from './ScheduleWorkflowDialog';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  workflowId?: string;
}

const nodeTypes = {
  GMAIL_TRIGGER: (props: NodeProps) => (
    <div data-testid={`node-${props.type.toLowerCase()}`}>
      <NodeSelector {...props} />
    </div>
  ),
  GMAIL_ACTION: (props: NodeProps) => (
    <div data-testid={`node-${props.type.toLowerCase()}`}>
      <NodeSelector {...props} />
    </div>
  ),
  OPENAI: (props: NodeProps) => (
    <div data-testid={`node-${props.type.toLowerCase()}`}>
      <NodeSelector {...props} />
    </div>
  ),
  SCRAPING: (props: NodeProps) => (
    <div data-testid={`node-${props.type.toLowerCase()}`}>
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
  ),
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
  selectorType?: 'css' | 'xpath';
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
  onSave,
  workflowId,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

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
    const defaultData = node.type === 'SCRAPING' ? {
      url: '',
      selector: '',
      selectorType: 'css' as const,
      attribute: '',
    } : {};

    node.data = {
      ...defaultData,
      ...node.data,
      onConfigChange: handleNodeDataChange,
    };
    setNodes((nds) => [...nds, node]);
  }, [setNodes, handleNodeDataChange]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    if (onSave) {
      onSave(nodes, edges.map(cleanEdgeData));
    }
  }, [onNodesChange, onSave, nodes, edges]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    if (onSave) {
      onSave(nodes, edges.map(cleanEdgeData));
    }
  }, [onEdgesChange, onSave, nodes, edges]);

  const handleScheduleClick = () => {
    if (!workflowId) {
      toast({
        title: "Error",
        description: "Please save the workflow first",
        variant: "destructive"
      });
      return;
    }
    setScheduleDialogOpen(true);
  };

  return (
    <div className="relative h-full w-full" data-testid="workflow-canvas">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          onClick={handleScheduleClick}
        >
          Schedule
        </Button>
        <AddNodeButton onAddNode={handleAddNode} />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          className: 'workflow-edge',
          data: { testid: 'edge' }
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {workflowId && (
        <ScheduleWorkflowDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          workflowId={workflowId}
          nodes={nodes}
          edges={edges}
        />
      )}
    </div>
  );
} 
