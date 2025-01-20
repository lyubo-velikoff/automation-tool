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

interface Execution {
  id: string;
  execution_id: string;
  status: string;
  results: {
    [nodeId: string]: {
      status: 'success' | 'error';
      result?: unknown;
      error?: string;
    };
  };
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
      fetchExecutions();
    }
  }, [workflowId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
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
                  <pre className="text-xs overflow-auto max-w-md">
                    {JSON.stringify(execution.results, null, 2)}
                  </pre>
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
