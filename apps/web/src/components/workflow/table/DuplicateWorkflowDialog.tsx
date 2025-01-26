"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { DUPLICATE_WORKFLOW } from "@/graphql/mutations";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/layout/dialog";
import { Label } from "@/components/ui/inputs/label";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/components/workflow/config/nodeTypes";

interface DuplicateWorkflowDialogProps {
  workflow: {
    id: string;
    name: string;
    nodes: Node<NodeData>[];
    edges: Edge[];
  };
}

export function DuplicateWorkflowDialog({
  workflow
}: DuplicateWorkflowDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(`${workflow.name} (Copy)`);
  const [isLoading, setIsLoading] = useState(false);

  const [duplicateWorkflow] = useMutation(DUPLICATE_WORKFLOW, {
    refetchQueries: ["GetWorkflows"]
  });

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      const { data } = await duplicateWorkflow({
        variables: { id: workflow.id }
      });

      if (!data?.duplicateWorkflow) {
        throw new Error("Failed to duplicate workflow");
      }

      toast({
        title: "Success",
        description: "Workflow duplicated successfully"
      });

      // Navigate to the new workflow
      await router.push(`/workflows/${data.duplicateWorkflow.id}`);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to duplicate workflow",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0'
          title='Duplicate workflow'
        >
          <Copy className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Duplicate Workflow</DialogTitle>
          <DialogDescription>
            Create a copy of this workflow with all its nodes and connections.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>New Workflow Name</Label>
            <Input
              id='name'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Enter workflow name'
            />
          </div>
          <div className='grid gap-2'>
            <Label>Preview</Label>
            <div className='rounded-md border p-4 space-y-3'>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium'>Nodes to be duplicated</h4>
                <ScrollArea className='h-[100px]'>
                  <div className='space-y-2'>
                    {workflow.nodes.map((node) => (
                      <div key={node.id} className='flex items-center gap-2'>
                        <Badge variant='outline'>{node.type}</Badge>
                        <span className='text-sm text-muted-foreground'>
                          {node.data?.label || node.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {workflow.edges.length} connection
                  {workflow.edges.length !== 1 ? "s" : ""} will be preserved
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg
                  className='mr-2 h-4 w-4 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Duplicating...
              </>
            ) : (
              "Duplicate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
