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

export const WorkflowSelector = () => {
  const [open, setOpen] = React.useState(false);
  const {
    options = [],
    loading,
    error,
    selectedWorkflow,
    setSelectedWorkflow
  } = useWorkflowSelection();

  // Handle error state
  if (error) {
    return (
      <Button variant='outline' className='w-[250px] justify-between' disabled>
        <span className='text-destructive'>Error loading workflows</span>
      </Button>
    );
  }

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
                    onSelect={(currentValue) => {
                      setSelectedWorkflow(
                        currentValue === selectedWorkflow ? null : currentValue
                      );
                      setOpen(false);
                    }}
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
