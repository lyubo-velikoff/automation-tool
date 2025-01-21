"use client";

import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useWorkflow } from '@/contexts/WorkflowContext';

export interface ExecutionResult {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'running';
  message?: string;
  workflowId: string;
  nodes: Node[];
  edges: Edge[];
}

export interface UseWorkflowExecutionProps {
  onExecute?: (workflowId: string) => Promise<void>;
}

export function useWorkflowExecution({ onExecute }: UseWorkflowExecutionProps = {}) {
  const { workflowId, nodes, edges } = useWorkflow();
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [currentExecution, setCurrentExecution] = useState<ExecutionResult | null>(null);

  const handleExecute = useCallback(async (workflowId: string) => {
    if (!workflowId || !onExecute) return;
    
    const executionId = `exec-${Date.now()}`;
    
    const newExecution: ExecutionResult = {
      id: executionId,
      timestamp: new Date().toISOString(),
      status: 'running',
      workflowId,
      nodes,
      edges
    };

    setCurrentExecution(newExecution);
    setExecutionHistory(prev => [newExecution, ...prev]);

    try {
      await onExecute(workflowId);
      
      // Update execution status to success
      const successExecution: ExecutionResult = {
        ...newExecution,
        status: 'success' as const,
        message: 'Workflow executed successfully'
      };
      
      setCurrentExecution(successExecution);
      setExecutionHistory(prev => 
        prev.map(exec => exec.id === executionId ? successExecution : exec)
      );
    } catch (error) {
      // Update execution status to error
      const errorExecution: ExecutionResult = {
        ...newExecution,
        status: 'error' as const,
        message: error instanceof Error ? error.message : 'Execution failed'
      };
      
      setCurrentExecution(errorExecution);
      setExecutionHistory(prev => 
        prev.map(exec => exec.id === executionId ? errorExecution : exec)
      );
    }
  }, [workflowId, nodes, edges, onExecute]);

  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
    setCurrentExecution(null);
  }, []);

  return {
    executionHistory,
    currentExecution,
    handleExecute,
    clearHistory
  };
} 
