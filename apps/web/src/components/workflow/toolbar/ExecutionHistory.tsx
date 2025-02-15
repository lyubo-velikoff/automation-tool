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
  History,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/data-display/accordion";
import { useParams } from "next/navigation";

interface NodeResult {
  nodeId: string;
  nodeName: string;
  status: string;
  results: Array<{
    text?: string;
    error?: string;
    [key: string]: any;
  }>;
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
  const params = useParams();
  const workflowId = params.id as string;
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading, refetch } = useQuery<{
    workflowExecutions: ExecutionResult[];
  }>(GET_WORKFLOW_EXECUTIONS, {
    variables: { workflowId },
    skip: !workflowId,
    fetchPolicy: 'network-only'
  });

  // Show button even if no executions
  const executionCount = data?.workflowExecutions?.length ?? 0;
  const latestExecution = data?.workflowExecutions?.[0];
  const hasErrors = latestExecution?.results?.some(r => r.status === "error");
  const isRunning = latestExecution?.status === "running";

  // Return button even if no executions
  if (!workflowId || loading) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn('h-9 w-9 shrink-0 rounded-lg', className)}
        disabled
        title="No executions yet"
      >
        <History className="h-5 w-5" />
      </Button>
    );
  }

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
        onClick={() => {
          refetch(); // Refetch when opening dialog
          setIsOpen(true);
        }}
        title={executionCount > 0 ? "View execution history" : "No executions yet"}
      >
        <History className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[800px] max-h-[80vh]">
          <DialogHeader className="mb-4">
            <DialogTitle>Execution History</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {executionCount} execution{executionCount !== 1 ? 's' : ''}
            </p>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full pr-4">
            {!data?.workflowExecutions?.length ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p>No executions yet</p>
                <p className="text-sm">Execute your workflow to see results here</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {data.workflowExecutions.map((execution) => {
                  const hasErrors = execution.results?.some(
                    (r) => r.status === "error"
                  );
                  const nodeResults = execution.results || [];

                  return (
                    <AccordionItem
                      key={execution.id}
                      value={execution.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center justify-between flex-1">
                          <div className="flex items-center gap-3">
                            {execution.status === "running" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                            ) : hasErrors ? (
                              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            )}
                            <span
                              className={cn(
                                "text-sm font-medium",
                                hasErrors ? "text-destructive" : ""
                              )}
                            >
                              {execution.status === "running"
                                ? "Running"
                                : hasErrors
                                ? "Failed"
                                : "Success"}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(execution.created_at).toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 border-l border-muted">
                          {nodeResults.map((result, index) => (
                            <div key={index} className="space-y-2 pl-4 -ml-px">
                              <div className="flex items-center gap-2">
                                {result.status === "completed" ? (
                                  <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                ) : result.status === "error" ? (
                                  <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                                ) : (
                                  <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                                )}
                                <span className="text-sm font-medium">
                                  Node {index + 1}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({result.nodeId})
                                </span>
                              </div>
                              {result.results && result.results.length > 0 && (
                                <div className="pl-5 text-sm">
                                  {result.results.map((item, idx) => {
                                    let content = '';
                                    
                                    if (typeof item === 'string') {
                                      content = item;
                                    } else if (item && typeof item === 'object') {
                                      if (item.error) {
                                        // Show error message if present
                                        content = `Error: ${item.error}`;
                                      } else if (item.text) {
                                        // Show text content if present (for OpenAI results)
                                        content = item.text;
                                      } else {
                                        // For other objects, try to extract meaningful data
                                        const entries = Object.entries(item);
                                        if (entries.length > 0) {
                                          content = entries
                                            .map(([key, value]) => {
                                              if (key === 'bySelector') {
                                                // Handle scraping results
                                                return Object.entries(value)
                                                  .map(([selector, results]) => {
                                                    const values = Array.isArray(results) 
                                                      ? results.map(r => Object.values(r)[0]).filter(Boolean)
                                                      : [results];
                                                    return `${selector}: ${values.join(', ')}`;
                                                  })
                                                  .join('\n');
                                              }
                                              return `${key}: ${JSON.stringify(value)}`;
                                            })
                                            .join('\n');
                                        } else {
                                          content = JSON.stringify(item, null, 2);
                                        }
                                      }
                                    } else {
                                      content = String(item);
                                    }

                                    return (
                                      <div 
                                        key={idx} 
                                        className={cn(
                                          "whitespace-pre-wrap py-1",
                                          item.error ? "text-destructive" : "text-muted-foreground"
                                        )}
                                      >
                                        {content}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
