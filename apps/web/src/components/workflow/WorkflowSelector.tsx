"use client";

import { useWorkflow } from "@/contexts/WorkflowContext";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { Node, Edge } from "reactflow";
import { NodeData } from "./config/nodeTypes";
import { useNodeManagement } from "@/hooks/useNodeManagement";

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
  const { setWorkflowId, setWorkflowName } = useWorkflow();
  const { handleWorkflowSelect } = useNodeManagement();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );

  // Sort workflows by updated_at or created_at
  const sortedWorkflows = useMemo(() => {
    if (!data?.workflows) return [];
    return [...data.workflows].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at);
      const dateB = new Date(b.updated_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [data?.workflows]);

  const handleSelect = useCallback(
    (workflow: Workflow) => {
      console.log("Selecting workflow:", workflow);

      // Update workflow state
      setWorkflowId(workflow.id);
      setWorkflowName(workflow.name);

      // Update nodes and edges through useNodeManagement
      handleWorkflowSelect(workflow.nodes, workflow.edges || []);

      setSelectedWorkflow(workflow);
      setOpen(false);
    },
    [handleWorkflowSelect, setWorkflowId, setWorkflowName]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {selectedWorkflow ? selectedWorkflow.name : "Select workflow..."}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search workflows...' />
          <CommandList>
            <CommandEmpty>No workflows found.</CommandEmpty>
            <CommandGroup>
              {sortedWorkflows.map((workflow: Workflow) => (
                <CommandItem
                  key={workflow.id}
                  value={workflow.id}
                  onSelect={() => handleSelect(workflow)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedWorkflow?.id === workflow.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {workflow.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
