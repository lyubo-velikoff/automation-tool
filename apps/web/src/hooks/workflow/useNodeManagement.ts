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
import { toast } from "sonner";

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
      const nodesWithHandlers = contextNodes.map((node: Node<NodeData> & { label?: string }) => {
        const handler = createConfigChangeHandler(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            label: node.label || node.data?.label,
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
      // Get the source and target nodes
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) {
        console.error('Source or target node not found');
        return;
      }

      // Validate connection based on node types
      if (targetNode.type === 'GMAIL_ACTION') {
        // Gmail action nodes should have their data sources connected first
        const isValid = sourceNode.type === 'SCRAPING' || sourceNode.type === 'OPENAI';
        if (!isValid) {
          toast.error("Gmail action nodes should receive data from Scraping or OpenAI nodes");
          return;
        }
      }

      // Add the edge if validation passes
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      setContextEdges(newEdges);

      // Log the execution order for debugging
      const orderedNodes = getExecutionOrder(nodes, newEdges);
      console.log('New execution order:', orderedNodes.map(n => n.type));
    },
    [edges, nodes, setEdges, setContextEdges]
  );

  // Helper function to determine execution order (same as server-side)
  const getExecutionOrder = (nodes: Node[], edges: Edge[]): Node[] => {
    // Create adjacency list
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    // Build graph
    edges.forEach(edge => {
      graph.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Find nodes with no dependencies
    const queue = nodes
      .filter(node => (inDegree.get(node.id) || 0) === 0)
      .map(node => node.id);
    
    const result: string[] = [];
    
    // Process queue
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    // Map back to nodes
    return result.map(id => nodes.find(n => n.id === id)!);
  };

  const createConfigChangeHandler = useCallback((initialNodeId: string) => {
    return (nodeId: string, newData: NodeData) => {
      const updatedNodes = nodesRef.current.map((n) => {
        if (n.id === initialNodeId) {
          return { 
            ...n,
            label: newData.label,
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
          onConfigChange: handler,
          label: `${type} Node`,
          ...(type === 'GMAIL_ACTION' && { to: '', subject: '', body: '' }),
          ...(type === 'GMAIL_TRIGGER' && { fromFilter: '', subjectFilter: '', pollingInterval: 5 }),
          ...(type === 'SCRAPING' && { url: '', selector: '', selectorType: 'css', attribute: 'text' }),
          ...(type === 'OPENAI' && { 
            template: '', 
            model: 'gpt-3.5-turbo', 
            maxTokens: 100,
            temperature: 0.7
          })
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
