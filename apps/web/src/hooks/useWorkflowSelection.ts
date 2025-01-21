import { useQuery } from '@apollo/client';
import { useMemo, useState, useEffect } from 'react';
import { GET_WORKFLOWS } from '@/graphql/queries';

export interface WorkflowOption {
  value: string;
  label: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: Position;
  data?: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkflowSelection = () => {
  const { data, loading, error, refetch } = useQuery(GET_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Log any errors that occur during the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching workflows:', error);
    }
  }, [error]);

  const workflows = useMemo<Workflow[]>(() => {
    if (!data?.workflows) {
      return [];
    }
    try {
      return data.workflows;
    } catch (err) {
      console.error('Error processing workflows data:', err);
      return [];
    }
  }, [data?.workflows]);

  const options = useMemo<WorkflowOption[]>(() => {
    try {
      return workflows.map(w => ({
        value: w.id,
        label: w.name || 'Untitled Workflow'
      }));
    } catch (err) {
      console.error('Error creating workflow options:', err);
      return [];
    }
  }, [workflows]);

  const selectedWorkflowData = useMemo(() => {
    try {
      return workflows.find(w => w.id === selectedWorkflow);
    } catch (err) {
      console.error('Error finding selected workflow:', err);
      return undefined;
    }
  }, [workflows, selectedWorkflow]);

  return {
    workflows,
    options,
    loading,
    error,
    refetch,
    selectedWorkflow,
    selectedWorkflowData,
    setSelectedWorkflow,
  };
}; 
