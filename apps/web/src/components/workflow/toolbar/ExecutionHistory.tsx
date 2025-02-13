"use client";

import { useQuery } from "@apollo/client";
import { GET_WORKFLOW_EXECUTIONS } from "@/graphql/queries";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/layout/dialog";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/layout/table";

interface NodeResult {
  nodeId: string;
  status: string;
  results?: string[];
}

type ExecutionResult = {
  id: string;
  workflow_id: string;
  execution_id: string;
  status: string;
  results?: NodeResult[];
  created_at: string;
};

interface ExecutionHistoryProps {
  history?: ExecutionResult[];
  currentExecution?: ExecutionResult | null;
  className?: string;
}

export function ExecutionHistory({
  history = [],
  currentExecution = null,
  className
}: ExecutionHistoryProps) {
  const { workflowId } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading } = useQuery<{
    workflowExecutions: ExecutionResult[];
  }>(GET_WORKFLOW_EXECUTIONS, {
    variables: { workflowId },
    skip: !workflowId
  });

  if (!workflowId || loading || !data?.workflowExecutions?.length) {
    return null;
  }

  const executionCount = data.workflowExecutions.length;
  const latestExecution = data.workflowExecutions[0];
  const hasErrors = latestExecution.results?.some(r => r.status === "error");
  const isRunning = latestExecution.status === "running";

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'h-9 w-9 shrink-0 rounded-lg',
          isRunning && 'text-primary border-primary',
          hasErrors && 'text-destructive border-destructive',
          className
        )}
        onClick={() => setIsOpen(true)}
        title="View execution history"
      >
        <History className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Execution History</span>
              <span className="text-sm text-muted-foreground font-normal">
                {executionCount} execution{executionCount !== 1 ? 's' : ''}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.workflowExecutions.map((execution) => {
                  const hasErrors = execution.results?.some(
                    (r) => r.status === "error"
                  );
                  const errorMessages = execution.results
                    ?.filter((r) => r.status === "error")
                    .map((r) => r.results?.[0])
                    .filter(Boolean);

                  return (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {execution.status === "running" ? (
                            <Loader2 className='h-4 w-4 animate-spin text-primary' />
                          ) : execution.status === "completed" && !hasErrors ? (
                            <CheckCircle2 className='h-4 w-4 text-success' />
                          ) : (
                            <AlertCircle className='h-4 w-4 text-destructive' />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              hasErrors ? "text-destructive" : ""
                            )}
                          >
                            {execution.status === "completed" && !hasErrors
                              ? "Success"
                              : execution.status === "completed" && hasErrors
                              ? "Failed"
                              : "Running"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm text-muted-foreground'>
                          {new Date(execution.created_at).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {hasErrors ? (
                          <div className='text-sm text-destructive'>
                            {errorMessages && errorMessages.length > 0 ? (
                              errorMessages.map((error, idx) => (
                                <div key={idx}>{String(error)}</div>
                              ))
                            ) : (
                              <div>An error occurred during execution</div>
                            )}
                          </div>
                        ) : execution.status === "completed" ? (
                          <span className='text-sm text-muted-foreground'>
                            Workflow completed successfully
                          </span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>
                            Execution in progress...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
