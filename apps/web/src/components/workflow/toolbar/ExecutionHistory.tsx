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

interface NodeResult {
  nodeId: string;
  status: string;
  results?: Array<{
    bySelector?: {
      [key: string]: Array<{ [key: string]: string }>
    }
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
          <DialogHeader className="mb-4">
            <DialogTitle>Execution History</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {executionCount} execution{executionCount !== 1 ? 's' : ''}
            </p>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full pr-4">
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
                          ) : execution.status === "completed" && !hasErrors ? (
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
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
                                    if ('bySelector' in item && item.bySelector) {
                                      // Handle the nested structure
                                      content = Object.entries(item.bySelector)
                                        .map(([key, valueArray]) => {
                                          // Extract values from the array of objects
                                          const values = valueArray
                                            .map(obj => Object.values(obj)[0])
                                            .filter(Boolean);
                                          return `${key}: ${values.join(', ')}`;
                                        })
                                        .join('\n');
                                    } else {
                                      // For other objects, try to extract meaningful data
                                      const entries = Object.entries(item);
                                      if (entries.length > 0) {
                                        content = entries
                                          .map(([key, value]) => `${key}: ${value}`)
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
                                      className="text-muted-foreground whitespace-pre-wrap py-1"
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
