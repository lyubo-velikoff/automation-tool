'use client';

import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function WorkflowsPage() {
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();
    
    setIsAuthenticated(!!user);
    setAuthToken(session?.access_token || null);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/workflows`,
      },
    });
  };

  const handleSave = async () => {
    if (!workflowName) {
      alert('Please enter a workflow name');
      return;
    }

    if (!authToken) {
      alert('You must be logged in to save workflows');
      return;
    }

    try {
      console.log('Saving workflow:', { name: workflowName, nodes, edges });
      
      const response = await fetch(`${API_URL}/api/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: workflowName,
          nodes,
          edges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.error || 'Failed to save workflow');
      }

      console.log('Workflow saved successfully:', data);
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert(error instanceof Error ? error.message : 'Failed to save workflow');
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
        <Button onClick={handleSave}>Save Workflow</Button>
      </div>
      <div className="flex-1">
        <WorkflowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onSave={handleCanvasChange}
        />
      </div>
    </div>
  );
} 
