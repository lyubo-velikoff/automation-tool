"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { ArrowUpDown, Pencil, Play, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useWorkflowHandlers } from "@/hooks/useWorkflowHandlers";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/layout/alert-dialog";
import React from "react";
import { DuplicateWorkflowDialog } from "@/components/workflow/table/DuplicateWorkflowDialog";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import type { Workflow as BaseWorkflow } from "@/gql/graphql";

// Extend the base Workflow type to ensure compatibility with ReactFlow
export type Workflow = Omit<BaseWorkflow, "nodes" | "edges"> & {
  nodes: Node<NodeData>[];
  edges: Edge[];
};

export interface WorkflowTag {
  id: string;
  name: string;
  color: string;
}

const ActionCell = ({ workflow }: { workflow: Workflow }) => {
  const router = useRouter();
  const { handleExecute, handleDelete, handleRestore } = useWorkflowHandlers();
  const [open, setOpen] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleNavigate = async (workflowId: string) => {
    setIsNavigating(true);
    router.push(`/workflows/${workflowId}`);
  };

  if (!workflow.is_active) {
    return (
      <div className='flex justify-end space-x-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => handleRestore(workflow.id)}
          className='h-8 w-8 p-0'
          title='Restore workflow'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
          >
            <path d='M3 7v6h6' />
            <path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex justify-end space-x-2'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleNavigate(workflow.id)}
        className='h-8 w-8 p-0'
        title='Edit workflow'
        disabled={isNavigating}
      >
        {isNavigating ? (
          <svg
            className='h-4 w-4 animate-spin'
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
        ) : (
          <Pencil className='h-4 w-4' />
        )}
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleExecute(workflow.id)}
        className='h-8 w-8 p-0'
        title='Execute workflow'
      >
        <Play className='h-4 w-4' />
      </Button>
      <DuplicateWorkflowDialog workflow={workflow} />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground'
            title='Delete workflow'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{workflow.name}&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete(workflow.id);
                setOpen(false);
              }}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const columns: ColumnDef<Workflow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='-ml-4'
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => <div className='font-medium'>{row.getValue("name")}</div>
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      const isActive = row.getValue(id) as boolean;
      return value === "active" ? isActive : !isActive;
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='-ml-4'
        >
          Created
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return format(new Date(date), "MMM d, yyyy");
    }
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='-ml-4'
        >
          Last Updated
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("updated_at") as string;
      return format(new Date(date), "MMM d, yyyy");
    }
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as WorkflowTag[];
      return (
        <div className='flex flex-wrap gap-1'>
          {tags?.map((tag) => (
            <Badge
              key={tag.id}
              variant='outline'
              style={{
                backgroundColor: tag.color + "20",
                borderColor: tag.color,
                color: tag.color
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const tags = row.getValue(id) as WorkflowTag[];
      return value.some((tagId: string) =>
        tags?.some((tag) => tag.id === tagId)
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell workflow={row.original} />
  }
];
