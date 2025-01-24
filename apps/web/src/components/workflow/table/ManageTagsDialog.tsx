"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_WORKFLOW_TAG, DELETE_WORKFLOW_TAG } from "@/graphql/mutations";
import { GET_WORKFLOW_TAGS } from "@/graphql/queries";
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
import { Tag, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/layout/alert-dialog";
import { WorkflowTag } from "./columns";

interface ManageTagsDialogProps {
  onTagsModified?: () => void;
}

export function ManageTagsDialog({ onTagsModified }: ManageTagsDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<WorkflowTag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [isLoading, setIsLoading] = useState(false);

  const { data: tagsData, refetch: refetchTags } = useQuery(GET_WORKFLOW_TAGS);
  const [createWorkflowTag] = useMutation(CREATE_WORKFLOW_TAG);
  const [deleteWorkflowTag] = useMutation(DELETE_WORKFLOW_TAG);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tag name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await createWorkflowTag({
        variables: {
          input: {
            name: newTagName.trim(),
            color: newTagColor
          }
        }
      });

      toast({
        title: "Success",
        description: "Tag created successfully"
      });

      setNewTagName("");
      await refetchTags();
      onTagsModified?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create tag",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      setIsLoading(true);
      await deleteWorkflowTag({
        variables: {
          id: tagToDelete.id
        }
      });

      toast({
        title: "Success",
        description: "Tag deleted successfully"
      });

      setTagToDelete(null);
      setDeleteDialogOpen(false);
      await refetchTags();
      onTagsModified?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete tag",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Tag className='h-4 w-4 mr-2' />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Manage Workflow Tags</DialogTitle>
          <DialogDescription>
            Create and manage tags to organize your workflows.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-6 py-4'>
          <div className='grid gap-4'>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <Label htmlFor='name'>Tag Name</Label>
                <Input
                  id='name'
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder='Enter tag name'
                />
              </div>
              <div className='w-32'>
                <Label htmlFor='color'>Color</Label>
                <Input
                  id='color'
                  type='color'
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className='h-10 px-2 py-1'
                />
              </div>
              <div className='flex items-end'>
                <Button
                  onClick={handleCreateTag}
                  disabled={isLoading || !newTagName.trim()}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className='grid gap-2'>
            <Label>Existing Tags</Label>
            <div className='grid gap-2'>
              {tagsData?.workflowTags?.map((tag: WorkflowTag) => (
                <div
                  key={tag.id}
                  className='flex items-center justify-between p-2 rounded-md border'
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setTagToDelete(tag);
                      setDeleteDialogOpen(true);
                    }}
                    className='h-8 w-8 p-0'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag &ldquo;{tagToDelete?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
