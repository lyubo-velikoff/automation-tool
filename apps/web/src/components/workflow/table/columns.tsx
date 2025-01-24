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

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ActionCell = ({ workflow }: { workflow: Workflow }) => {
  const router = useRouter();
  const { handleExecute, handleDelete, handleRestore } = useWorkflowHandlers();
  const [open, setOpen] = React.useState(false);

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
        onClick={() => router.push(`/workflow/${workflow.id}`)}
        className='h-8 w-8 p-0'
        title='Edit workflow'
      >
        <Pencil className='h-4 w-4' />
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
    id: "actions",
    cell: ({ row }) => <ActionCell workflow={row.original} />
  }
];
