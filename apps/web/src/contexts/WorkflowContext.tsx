"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode
} from "react";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/components/workflow/config/nodeTypes";

interface WorkflowContextType {
  workflowId: string | null;
  workflowName: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  isExecuting: boolean;
  isSaving: boolean;
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setWorkflowState: (state: {
    workflowId: string;
    workflowName: string;
    nodes: Node<NodeData>[];
    edges: Edge[];
  }) => void;
  handleSave: (name: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  handleExecute: (nodes: Node[], edges: Edge[]) => Promise<void>;
  handleSchedule: (nodes: Node[], edges: Edge[]) => void;
  clearWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

interface WorkflowProviderProps {
  children: ReactNode;
  onSave?: (name: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  onExecute?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  onSchedule?: (nodes: Node[], edges: Edge[]) => void;
}

export function WorkflowProvider({
  children,
  onSave,
  onExecute,
  onSchedule
}: WorkflowProviderProps) {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const setWorkflowState = useCallback(
    (state: {
      workflowId: string;
      workflowName: string;
      nodes: Node<NodeData>[];
      edges: Edge[];
    }) => {
      setWorkflowId(state.workflowId);
      setWorkflowName(state.workflowName);
      setNodes(state.nodes);
      setEdges(state.edges);
    },
    []
  );

  const handleSave = useCallback(
    async (name: string, nodes: Node[], edges: Edge[]) => {
      if (!onSave) return;
      setIsSaving(true);
      try {
        await onSave(name, nodes, edges);
      } finally {
        setIsSaving(false);
      }
    },
    [onSave]
  );

  const handleExecute = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!onExecute || !workflowId) {
        console.log("Cannot execute: missing onExecute or workflowId", {
          onExecute,
          workflowId
        });
        return;
      }

      setIsExecuting(true);
      try {
        console.log("Context executing workflow with:", {
          workflowId,
          nodes,
          edges
        });
        await onExecute(nodes, edges);
      } finally {
        setIsExecuting(false);
      }
    },
    [onExecute, workflowId]
  );

  const handleSchedule = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!onSchedule || !workflowId) return;
      onSchedule(nodes, edges);
    },
    [onSchedule, workflowId]
  );

  const clearWorkflow = useCallback(() => {
    setWorkflowId(null);
    setWorkflowName("");
    setNodes([]);
    setEdges([]);
    setIsExecuting(false);
    setIsSaving(false);
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        workflowId,
        workflowName,
        nodes,
        edges,
        isExecuting,
        isSaving,
        setWorkflowId,
        setWorkflowName,
        setNodes,
        setEdges,
        setIsExecuting,
        setIsSaving,
        setWorkflowState,
        handleSave,
        handleExecute,
        handleSchedule,
        clearWorkflow
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
