"use client";

import { useCallback } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange
} from "reactflow";
import { useWorkflow } from "@/contexts/WorkflowContext";

export function useNodeManagement() {
  const { setNodes: setContextNodes, setEdges: setContextEdges } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: 100, y: 100 },
        data: { label: `${type} Node` }
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setContextNodes(newNodes);
    },
    [nodes, setNodes, setContextNodes]
  );

  const handleWorkflowSelect = useCallback(
    (selectedNodes: Node[], selectedEdges: Edge[]) => {
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
    onNodesChange: (changes: NodeChange[]) => {
      onNodesChange(changes);
      setContextNodes(nodes);
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      setContextEdges(edges);
    },
    onConnect,
    handleAddNode,
    handleWorkflowSelect
  };
} 
