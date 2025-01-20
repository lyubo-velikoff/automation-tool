'use client';

import { useState, useEffect, useRef } from 'react';
import { Edge, XYPosition } from 'reactflow';
import type { Node } from 'reactflow';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import ConnectionStatus from '@/components/workflow/ConnectionStatus';
import OpenAISettingsDialog from '@/components/workflow/OpenAISettingsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@apollo/client';
import { CREATE_WORKFLOW, EXECUTE_WORKFLOW } from '@/graphql/mutations';
import { PlayIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ExecutionHistory from '@/components/workflow/ExecutionHistory';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CleanNode {
  id: string;
  type: string;
  label: string;
  position: XYPosition;
  data: Record<string, unknown>;
}

export default function WorkflowsPage() {
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const { toast } = useToast();
  const executionHistoryRef = useRef<{ fetchExecutions: () => Promise<void> }>(null);
  const { signIn } = useAuth();

  const [createWorkflow, { loading: saveLoading }] = useMutation(CREATE_WORKFLOW, {
    onError: (error) => {
      console.error('GraphQL error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save workflow"
      });
    },
    onCompleted: (data) => {
      setCurrentWorkflowId(data.createWorkflow.id);
      toast({
        title: "Success",
        description: "Workflow saved successfully!"
      });
    }
  });

  const [executeWorkflow, { loading: executeLoading }] = useMutation(EXECUTE_WORKFLOW, {
    onError: (error) => {
      console.error('Execution error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to execute workflow"
      });
    },
    onCompleted: async (data) => {
      if (data.executeWorkflow.success) {
        // Update nodes with execution results
        setNodes(prevNodes => prevNodes.map(node => {
          const nodeResults = data.executeWorkflow.results?.[node.id];
          if (nodeResults && node.type === 'SCRAPING') {
            return {
              ...node,
              data: {
                ...node.data,
                results: nodeResults.results
              }
            };
          }
          return node;
        }));

        toast({
          title: "Success",
          description: data.executeWorkflow.message || "Workflow executed successfully!"
        });
        await executionHistoryRef.current?.fetchExecutions();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.executeWorkflow.message || "Failed to execute workflow"
        });
      }
    }
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const handleLogin = async () => {
    signIn();
  };

  const cleanNodeForServer = (node: Node): CleanNode => {
    const cleanData = { ...node.data };
    delete cleanData.onConfigChange;
    
    return {
      id: node.id,
      type: node.type || 'default',
      label: node.data?.label || 'Untitled Node',
      position: node.position,
      data: cleanData,
    };
  };

  const handleSave = async () => {
    if (!workflowName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a workflow name"
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save workflows"
      });
      return;
    }

    try {
      const { data } = await createWorkflow({
        variables: {
          input: {
            name: workflowName,
            description: '',
            nodes: nodes.map(cleanNodeForServer),
            edges
          }
        }
      });

      if (!data?.createWorkflow) {
        throw new Error('No data returned from mutation');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleExecute = async () => {
    if (!currentWorkflowId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please save the workflow first"
      });
      return;
    }

    await executeWorkflow({
      variables: { workflowId: currentWorkflowId }
    });
  };

  const handleCanvasChange = (updatedNodes: Node[], updatedEdges: Edge[]) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
        <Button onClick={handleLogin}>Login with GitHub</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <Label htmlFor="workflow-name">Workflow Name:</Label>
          <Input
            id="workflow-name"
            value={workflowName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)}
            placeholder="Enter workflow name"
            className="w-64"
          />
        </div>
        <Button onClick={handleSave} disabled={saveLoading}>
          {saveLoading ? 'Saving...' : 'Save Workflow'}
        </Button>
        <Button 
          onClick={handleExecute} 
          disabled={executeLoading || !currentWorkflowId}
          variant="secondary"
          className="gap-2"
        >
          <PlayIcon className="h-4 w-4" />
          {executeLoading ? 'Executing...' : 'Test Workflow'}
        </Button>
        <div className="ml-auto">
          <ConnectionStatus onOpenAISettings={() => setOpenAISettingsOpen(true)} />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-[1fr,400px]">
        <div className="h-full">
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onSave={handleCanvasChange}
            workflowId={currentWorkflowId || ''}
          />
        </div>
        {currentWorkflowId && (
          <div className="border-l p-4 overflow-auto">
            <ExecutionHistory 
              ref={executionHistoryRef}
              workflowId={currentWorkflowId} 
            />
          </div>
        )}
      </div>
      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
} 
