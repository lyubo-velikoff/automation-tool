'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ExecutionHistoryProps {
  workflowId: string;
}

interface NodeResult {
  nodeId: string;
  status: 'success' | 'error';
  results: string[];
}

interface Execution {
  id: string;
  execution_id: string;
  status: string;
  message?: string;
  results: NodeResult[];
  created_at: string;
}

export interface ExecutionHistoryRef {
  fetchExecutions: () => Promise<void>;
}

const ExecutionHistory = forwardRef<ExecutionHistoryRef, ExecutionHistoryProps>(function ExecutionHistory(
  { workflowId }, 
  ref
) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchExecutions = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      
      // Log the data to help debug
      console.log('Fetched executions:', data);
      
      setExecutions(data || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch execution history');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchExecutions
  }));

  useEffect(() => {
    if (workflowId) {
      console.log('Fetching executions for workflow:', workflowId);
      fetchExecutions();
    }
  }, [workflowId]);

  const getStatusColor = (status: string) => {
    console.log('Getting status color for:', status);
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        console.log('Unknown status:', status);
        return 'bg-gray-500';
    }
  };

  const renderResults = (execution: Execution) => {
    console.log('Rendering execution:', execution);
    if (!execution.results?.length) {
      return (
        <div className="space-y-2">
          {execution.message && (
            <div className="text-sm text-muted-foreground">
              Message: {execution.message}
            </div>
          )}
          <span className="text-muted-foreground">No node results available</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {execution.message && (
          <div className="text-sm text-muted-foreground">
            Message: {execution.message}
          </div>
        )}
        {execution.results.map((result, index) => (
          <div key={`${result.nodeId}-${index}`} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Node: {result.nodeId}</span>
              <Badge 
                variant="secondary"
                className={`${result.status === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {result.status}
              </Badge>
            </div>
            {result.results?.map((item, i) => (
              <div key={i} className="text-sm pl-4 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading execution history...</div>;
  }

  if (error) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Execution History</h3>
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }

  if (executions.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Execution History</h3>
        <div className="text-center text-muted-foreground">No executions yet</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Execution History</h3>
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Execution ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Results</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell className="font-mono text-sm">
                  {execution.execution_id}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(execution.status)} text-white`}
                  >
                    {execution.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {renderResults(execution)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
});

ExecutionHistory.displayName = 'ExecutionHistory';

export default ExecutionHistory; 
