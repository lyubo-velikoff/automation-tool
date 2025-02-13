"use client";

import { useWorkflow } from "@/contexts/workflow/WorkflowContext";
import { Button } from "@/components/ui/inputs/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/inputs/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/feedback/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { useNodeManagement } from "@/hooks/workflow/useNodeManagement";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Workflow {
  id: string;
  name: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  updated_at?: string;
  created_at: string;
}

export function WorkflowSelector() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery(GET_WORKFLOWS);
  const { workflowId, setWorkflowId, setWorkflowName } = useWorkflow();
  const { handleWorkflowSelect } = useNodeManagement();
  const router = useRouter();

  // Sort workflows by updated_at or created_at
  const sortedWorkflows = useMemo(() => {
    if (!data?.workflows) return [];
    return [...data.workflows].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at);
      const dateB = new Date(b.updated_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [data?.workflows]);

  // Get the currently selected workflow from the sorted list
  const selectedWorkflow = useMemo(() => {
    return sortedWorkflows.find((w) => w.id === workflowId) || null;
  }, [sortedWorkflows, workflowId]);

  const handleSelect = useCallback(
    (workflow: Workflow) => {
      setWorkflowId(workflow.id);
      setWorkflowName(workflow.name);
      handleWorkflowSelect(workflow.nodes, workflow.edges || []);
      setOpen(false);
      router.push(`/workflows/${workflow.id}`);
    },
    [handleWorkflowSelect, setWorkflowId, setWorkflowName, router]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[300px] justify-between'
        >
          {selectedWorkflow ? selectedWorkflow.name : "Select workflow..."}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0'>
        <Command>
          <CommandInput placeholder='Search workflows...' />
          <CommandList>
            <CommandEmpty>No workflows found.</CommandEmpty>
            <CommandGroup>
              {sortedWorkflows.map((workflow: Workflow) => {
                const date = new Date(
                  workflow.updated_at || workflow.created_at
                );
                const formattedDate = format(date, "MMM d, yyyy HH:mm");
                return (
                  <CommandItem
                    key={workflow.id}
                    value={`${workflow.name} ${formattedDate}`}
                    onSelect={() => handleSelect(workflow)}
                    className='flex justify-between'
                  >
                    <div className='flex items-center'>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          workflow.id === workflowId
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span>{workflow.name}</span>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {formattedDate}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
