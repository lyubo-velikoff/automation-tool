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
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import { NodeData } from "@/components/workflow/config/nodeTypes";

export function useNodeManagement() {
  const { nodes: contextNodes, edges: contextEdges, setNodes: setContextNodes, setEdges: setContextEdges } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState(contextNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(contextEdges || []);
  const nodesRef = useRef<Node<NodeData>[]>(contextNodes || []);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep nodesRef in sync
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync with context when nodes change
  useEffect(() => {
    if (contextNodes?.length) {
      const nodesWithHandlers = contextNodes.map(node => {
        const handler = createConfigChangeHandler(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            onConfigChange: handler
          }
        };
      });
      setNodes(nodesWithHandlers);
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
      const updatedNodes = applyNodeChanges(changes, nodesRef.current);
      setNodes(updatedNodes);
      setContextNodes(updatedNodes);
    },
    [onNodesChange, setNodes, setContextNodes]
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

  const createConfigChangeHandler = useCallback((initialNodeId: string) => {
    return (nodeId: string, newData: NodeData) => {
      const updatedNodes = nodesRef.current.map((n) => {
        if (n.id === initialNodeId) {
          return { 
            ...n, 
            data: { 
              ...newData,
              onConfigChange: n.data.onConfigChange 
            } 
          };
        }
        return n;
      });
      setNodes(updatedNodes);
      setContextNodes(updatedNodes);
    };
  }, [setNodes, setContextNodes]);

  const handleAddNode = useCallback(
    (type: string) => {
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

      const newNodes = [...nodesRef.current, newNode];
      setNodes(newNodes);
      setContextNodes(newNodes);
    },
    [setNodes, setContextNodes, createConfigChangeHandler]
  );

  const handleWorkflowSelect = useCallback(
    (selectedNodes: Node<NodeData>[], selectedEdges: Edge[]) => {
      // Create new handlers for each node
      const nodesWithHandlers = selectedNodes.map(node => {
        const handler = createConfigChangeHandler(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            onConfigChange: handler
          }
        };
      });
      
      setNodes(nodesWithHandlers);
      setEdges(selectedEdges);
      setContextNodes(nodesWithHandlers);
      setContextEdges(selectedEdges);
    },
    [setNodes, setEdges, setContextNodes, setContextEdges, createConfigChangeHandler]
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
