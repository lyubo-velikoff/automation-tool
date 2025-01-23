"use client";

import { useCallback, useEffect, useRef } from "react";
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

// Batch updates within 100ms
const BATCH_DELAY = 100;

export function useNodeManagement() {
  const { nodes: contextNodes, edges: contextEdges, setNodes: setContextNodes, setEdges: setContextEdges } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState(contextNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(contextEdges || []);
  const nodesRef = useRef(nodes);
  const batchTimeoutRef = useRef<NodeJS.Timeout>();

  // Keep nodesRef in sync
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Cleanup batch timeout
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  // Batch update function
  const batchUpdate = useCallback((updatedNodes: Node[]) => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    batchTimeoutRef.current = setTimeout(() => {
      setNodes(updatedNodes);
      setContextNodes(updatedNodes);
    }, BATCH_DELAY);
  }, [setNodes, setContextNodes]);

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
      console.log('handleNodesChange:', { changes, currentNodes: nodesRef.current });
      onNodesChange(changes);
      const updatedNodes = applyNodeChanges(changes, nodesRef.current);
      console.log('Nodes after changes:', updatedNodes);
      batchUpdate(updatedNodes);
    },
    [onNodesChange, batchUpdate]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      setContextEdges(updatedEdges);
    },
    [edges, onEdgesChange, setEdges, setContextEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      setContextEdges(newEdges);
    },
    [edges, setEdges, setContextEdges]
  );

  const createConfigChangeHandler = useCallback((nodeId: string) => {
    return (newData: NodeData) => {
      console.log('Node onConfigChange called:', { nodeId, newData, currentNodes: nodesRef.current });
      const updatedNodes = nodesRef.current.map((n) => {
        if (n.id === nodeId) {
          console.log('Updating node:', n.id);
          const handler = createConfigChangeHandler(nodeId);
          return { 
            ...n, 
            data: { 
              ...newData,
              onConfigChange: handler
            } 
          };
        }
        return n;
      });
      console.log('Updated nodes:', updatedNodes);
      batchUpdate(updatedNodes);
    };
  }, [batchUpdate]);

  const handleAddNode = useCallback(
    (type: string) => {
      console.log('handleAddNode called:', { type });
      const nodeId = `${type}-${Date.now()}`;
      const handler = createConfigChangeHandler(nodeId);
      
      const newNode = {
        id: nodeId,
        type,
        position: { x: 100, y: 100 },
        data: { 
          label: `${type} Node`,
          onConfigChange: handler
        }
      } as Node<NodeData>;

      console.log('New node created:', newNode);
      const newNodes = [...nodesRef.current, newNode];
      setNodes(newNodes);
      setContextNodes(newNodes);
    },
    [setNodes, setContextNodes, createConfigChangeHandler]
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
