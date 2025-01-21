"use client";

import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ExecutionResult } from "@/hooks/useWorkflowExecution";

interface ExecutionHistoryProps {
  history: ExecutionResult[];
  currentExecution: ExecutionResult | null;
  className?: string;
}

export function ExecutionHistory({
  history,
  currentExecution,
  className
}: ExecutionHistoryProps) {
  // if (history.length === 0) {
  //   return null;
  // }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
        <CardDescription>Recent workflow executions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[200px] pr-4'>
          <div className='space-y-4'>
            {history.map((execution) => (
              <div
                key={execution.id}
                className={cn(
                  "flex items-center space-x-4 rounded-lg border p-4",
                  execution.id === currentExecution?.id &&
                    "border-primary bg-primary/5"
                )}
              >
                <div className='flex-shrink-0'>
                  {execution.status === "running" ? (
                    <Loader2 className='h-5 w-5 animate-spin text-primary' />
                  ) : execution.status === "success" ? (
                    <CheckCircle2 className='h-5 w-5 text-success' />
                  ) : (
                    <AlertCircle className='h-5 w-5 text-destructive' />
                  )}
                </div>
                <div className='flex-grow min-w-0'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium'>
                      {execution.status === "running"
                        ? "Executing workflow..."
                        : execution.status === "success"
                        ? "Execution completed"
                        : "Execution failed"}
                    </p>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(execution.timestamp), "HH:mm:ss")}
                    </span>
                  </div>
                  {execution.message && (
                    <p className='text-sm text-muted-foreground truncate'>
                      {execution.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
