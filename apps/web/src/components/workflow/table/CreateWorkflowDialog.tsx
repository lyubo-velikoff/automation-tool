"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { CREATE_WORKFLOW } from "@/graphql/mutations";
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
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/inputs/textarea";

export function CreateWorkflowDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createWorkflow] = useMutation(CREATE_WORKFLOW, {
    refetchQueries: ["GetWorkflows"]
  });

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await createWorkflow({
        variables: {
          input: {
            name: name.trim(),
            description: description.trim(),
            nodes: [],
            edges: []
          }
        }
      });

      if (!data?.createWorkflow) {
        throw new Error("Failed to create workflow");
      }

      toast({
        title: "Success",
        description: "Workflow created successfully"
      });

      // Navigate to the new workflow
      router.push(`/workflow/${data.createWorkflow.id}`);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='h-4 w-4 mr-2' />
          New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Create a new workflow and start adding automation steps.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter workflow name'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Enter workflow description'
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
