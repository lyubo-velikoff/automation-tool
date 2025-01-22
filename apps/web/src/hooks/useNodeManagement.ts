"use client";

import { useCallback, useEffect } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from "reactflow";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { NodeData } from "@/components/workflow/config/nodeTypes";

export function useNodeManagement() {
  const { nodes: contextNodes, edges: contextEdges, setNodes: setContextNodes, setEdges: setContextEdges } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState(contextNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(contextEdges || []);

  // Sync with context when nodes change
  useEffect(() => {
    if (contextNodes?.length) {
      setNodes(contextNodes);
    }
  }, [contextNodes, setNodes]);

  // Sync with context when edges change
  useEffect(() => {
    if (contextEdges?.length) {
      setEdges(contextEdges);
    }
  }, [contextEdges, setEdges]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      const updatedNodes = applyNodeChanges(changes, nodes);
      setContextNodes(updatedNodes);
    },
    [nodes, onNodesChange, setContextNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      const updatedEdges = applyEdgeChanges(changes, edges);
      setContextEdges(updatedEdges);
    },
    [edges, onEdgesChange, setContextEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      setContextEdges(newEdges);
    },
    [edges, setEdges, setContextEdges]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: 100, y: 100 },
        data: { 
          label: `${type} Node`,
          onConfigChange: (nodeId: string, newData: NodeData) => {
            const updatedNodes = nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
            );
            setNodes(updatedNodes);
            setContextNodes(updatedNodes);
          }
        }
      } as Node<NodeData>;

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setContextNodes(newNodes);
    },
    [nodes, setNodes, setContextNodes]
  );

  const handleWorkflowSelect = useCallback(
    (selectedNodes: Node<NodeData>[], selectedEdges: Edge[]) => {
      setNodes(selectedNodes);
      setEdges(selectedEdges);
      setContextNodes(selectedNodes);
      setContextEdges(selectedEdges);
    },
    [setNodes, setEdges, setContextNodes, setContextEdges]
  );

  return {
    nodes,
    edges,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect,
    handleAddNode,
    handleWorkflowSelect
  };
} 
