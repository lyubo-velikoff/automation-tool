"use client";

import { useQuery } from "@apollo/client";
import { GET_WORKFLOW_EXECUTIONS } from "@/graphql/queries";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/layout/card";
import { Button } from "@/components/ui/inputs/button";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NodeResult {
  nodeId: string;
  status: string;
  results?: string[];
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  execution_id: string;
  status: string;
  results?: NodeResult[];
  created_at: string;
}

interface ExecutionHistoryProps {
  className?: string;
}

export function ExecutionHistory({ className }: ExecutionHistoryProps) {
  const { workflowId } = useWorkflow();
  const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(
    new Set()
  );
  const { data, loading } = useQuery<{
    workflowExecutions: WorkflowExecution[];
  }>(GET_WORKFLOW_EXECUTIONS, {
    variables: { workflowId },
    skip: !workflowId,
    pollInterval: 5000 // Poll every 5 seconds for updates
  });

  if (!workflowId || loading || !data?.workflowExecutions?.length) {
    return null;
  }

  const toggleExpand = (executionId: string) => {
    const newExpanded = new Set(expandedExecutions);
    if (newExpanded.has(executionId)) {
      newExpanded.delete(executionId);
    } else {
      newExpanded.add(executionId);
    }
    setExpandedExecutions(newExpanded);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
        <CardDescription>Recent workflow executions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[200px] pr-4'>
          <div className='space-y-4'>
            {data.workflowExecutions.map((execution) => {
              const isExpanded = expandedExecutions.has(execution.id);
              const hasErrors = execution.results?.some(
                (r) => r.status === "error"
              );

              return (
                <div
                  key={execution.id}
                  className={cn(
                    "rounded-lg border",
                    hasErrors ? "border-destructive/50" : "border-border"
                  )}
                >
                  <Button
                    variant='ghost'
                    className={cn(
                      "w-full flex items-center justify-between p-4",
                      hasErrors ? "text-destructive hover:text-destructive" : ""
                    )}
                    onClick={() => toggleExpand(execution.id)}
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        {execution.status === "running" ? (
                          <Loader2 className='h-5 w-5 animate-spin text-primary' />
                        ) : execution.status === "completed" ? (
                          <CheckCircle2 className='h-5 w-5 text-success' />
                        ) : (
                          <AlertCircle className='h-5 w-5 text-destructive' />
                        )}
                      </div>
                      <div className='flex flex-col items-start'>
                        <p className='text-sm font-medium'>
                          {execution.status.charAt(0).toUpperCase() +
                            execution.status.slice(1)}
                          {hasErrors && " (with errors)"}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {new Date(execution.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className='h-4 w-4' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </Button>

                  {isExpanded && execution.results && (
                    <div className='px-4 pb-4 space-y-2'>
                      {execution.results.map((result) => (
                        <div
                          key={result.nodeId}
                          className={cn(
                            "p-2 rounded text-sm",
                            result.status === "error"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted"
                          )}
                        >
                          <div className='font-medium'>
                            Node: {result.nodeId}
                          </div>
                          <div className='text-xs'>Status: {result.status}</div>
                          {result.results?.map((res, idx) => (
                            <div key={idx} className='text-xs mt-1 break-words'>
                              {result.status === "error"
                                ? "Error: "
                                : "Result: "}
                              {res}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
