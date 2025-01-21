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
      console.log('Processing workflows data:', data.workflows);
      // Sort workflows by updated_at (most recent first), then by created_at
      return [...data.workflows].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (err) {
      console.error('Error processing workflows data:', err);
      return [];
    }
  }, [data?.workflows]);

  const options = useMemo<WorkflowOption[]>(() => {
    try {
      console.log('Creating workflow options from workflows:', workflows);
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
    console.log('Finding workflow data for ID:', selectedWorkflow);
    if (!selectedWorkflow) return null;
    
    try {
      const workflow = workflows.find(w => w.id === selectedWorkflow);
      console.log('Raw workflow data:', JSON.stringify(workflow, null, 2));
      
      if (!workflow) {
        console.log('No workflow found with ID:', selectedWorkflow);
        return null;
      }

      // Ensure nodes have the correct structure
      const processedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.map(node => ({
          id: node.id,
          type: node.type,
          label: node.label || `${node.type} Node`,
          position: node.position || { x: 100, y: 100 },
          data: {
            ...node.data,
            label: node.label || `${node.type} Node`
          }
        }))
      };

      console.log('Processed workflow data:', JSON.stringify(processedWorkflow, null, 2));
      return processedWorkflow;
    } catch (err) {
      console.error('Error processing workflow data:', err);
      return null;
    }
  }, [selectedWorkflow, workflows]);

  // Log state changes
  useEffect(() => {
    console.log('Workflow selection state changed:', {
      selectedWorkflow,
      selectedWorkflowData,
      workflows: workflows.length
    });
  }, [selectedWorkflow, selectedWorkflowData, workflows]);

  return {
    options,
    loading,
    error,
    selectedWorkflow,
    setSelectedWorkflow,
    selectedWorkflowData,
    refetch
  };
}; 
