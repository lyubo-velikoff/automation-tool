import { useCallback } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  XYPosition
} from "reactflow";
import { NodeData } from "@/components/workflow/config/nodeTypes";

export interface UseNodeManagementProps {
  onSave?: (name: string, nodes: Node[], edges: Edge[]) => void;
  onExecute?: (nodes: Node[], edges: Edge[]) => void;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
}

export function useNodeManagement({
  onSave,
  onExecute,
  onSchedule
}: UseNodeManagementProps = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: NodeData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...newData,
                onConfigChange: handleNodeDataChange,
                label: newData.label || `${node.type} Node`
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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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

  const handleSave = useCallback(
    (workflowName: string) => {
      if (onSave) onSave(workflowName, nodes, edges);
    },
    [nodes, edges, onSave]
  );

  const handleExecute = useCallback(() => {
    if (onExecute) onExecute(nodes, edges);
  }, [nodes, edges, onExecute]);

  const handleSchedule = useCallback(() => {
    if (onSchedule) onSchedule(nodes, edges);
  }, [nodes, edges, onSchedule]);

  const handleWorkflowSelect = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeDataChange,
    handleAddNode,
    handleSave,
    handleExecute,
    handleSchedule,
    handleWorkflowSelect
  };
} 
