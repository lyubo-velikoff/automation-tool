'use client';

import { useState, useEffect } from 'react';
import { Node, Edge, XYPosition } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import ConnectionStatus from '@/components/workflow/ConnectionStatus';
import OpenAISettingsDialog from '@/components/workflow/OpenAISettingsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@apollo/client';
import { CREATE_WORKFLOW } from '@/graphql/mutations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CleanNode {
  id: string;
  type: string;
  position: XYPosition;
  data: Record<string, unknown>;
}

export default function WorkflowsPage() {
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);

  const [createWorkflow, { loading }] = useMutation(CREATE_WORKFLOW, {
    onError: (error) => {
      console.error('GraphQL error:', error);
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
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/workflows`,
      },
    });
  };

  const cleanNodeForServer = (node: Node): CleanNode => ({
    id: node.id,
    type: node.type || 'default',
    position: node.position,
    data: node.data || {},
  });

  const handleSave = async () => {
    if (!workflowName) {
      alert('Please enter a workflow name');
      return;
    }

    if (!isAuthenticated) {
      alert('You must be logged in to save workflows');
      return;
    }

    try {
      console.log('Saving workflow:', { name: workflowName, nodes, edges });
      
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

      if (data?.createWorkflow) {
        console.log('Workflow saved successfully:', data.createWorkflow);
        alert('Workflow saved successfully!');
      } else {
        throw new Error('No data returned from mutation');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow. Please try again.');
    }
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
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Workflow'}
        </Button>
        <div className="ml-auto">
          <ConnectionStatus onOpenAISettings={() => setOpenAISettingsOpen(true)} />
        </div>
      </div>
      <div className="flex-1">
        <WorkflowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onSave={handleCanvasChange}
        />
      </div>
      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
        onSuccess={() => {
          // Refresh connection status
          window.location.reload();
        }}
      />
    </div>
  );
} 
