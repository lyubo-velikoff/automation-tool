import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useWorkflowSelection } from "@/hooks/useWorkflowSelection";
import { Icons } from "@/components/ui/icons";
import { Node, Edge } from "reactflow";

export const WorkflowSelector = ({
  onWorkflowSelect
}: {
  onWorkflowSelect?: (nodes: Node[], edges: Edge[]) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const {
    options = [],
    loading,
    error,
    selectedWorkflow,
    setSelectedWorkflow,
    selectedWorkflowData
  } = useWorkflowSelection();

  // Handle workflow data changes
  React.useEffect(() => {
    if (selectedWorkflowData?.nodes) {
      console.log("Processing workflow selection:", selectedWorkflow);
      console.log("Workflow data:", selectedWorkflowData);

      const processedNodes = selectedWorkflowData.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: {
          x: node.position?.x ?? 100,
          y: node.position?.y ?? 100
        },
        data: {
          ...node.data,
          label: node.label || `${node.type} Node`
        },
        draggable: true,
        connectable: true,
        selectable: true,
        width: 350,
        height: 200
      }));

      onWorkflowSelect?.(processedNodes, selectedWorkflowData.edges || []);
    }
  }, [selectedWorkflowData, selectedWorkflow, onWorkflowSelect]);

  // Handle error state
  if (error) {
    return (
      <Button variant='outline' className='w-[250px] justify-between' disabled>
        <span className='text-destructive'>Error loading workflows</span>
      </Button>
    );
  }

  const handleSelect = (currentValue: string) => {
    const isDeselecting = currentValue === selectedWorkflow;
    setSelectedWorkflow(isDeselecting ? null : currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[250px] justify-between'
          disabled={loading}
        >
          {loading ? (
            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          ) : selectedWorkflow ? (
            options.find((option) => option.value === selectedWorkflow)
              ?.label ?? "Unknown workflow"
          ) : (
            "Select workflow..."
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[250px] p-0'>
        <Command>
          <CommandInput placeholder='Search workflow...' />
          <CommandList>
            <CommandEmpty>No workflow found.</CommandEmpty>
            <CommandGroup>
              {Array.isArray(options) && options.length > 0 ? (
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedWorkflow === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>No workflows available</CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
