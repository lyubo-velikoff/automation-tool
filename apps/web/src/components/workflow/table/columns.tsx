"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { Pencil, Play } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useWorkflowHandlers } from "@/hooks/useWorkflowHandlers";

export interface Workflow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ActionCell = ({ workflow }: { workflow: Workflow }) => {
  const router = useRouter();
  const { handleExecute } = useWorkflowHandlers();

  return (
    <div className='flex justify-end space-x-2'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => router.push(`/workflow/${workflow.id}`)}
        className='h-8 w-8 p-0'
      >
        <Pencil className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleExecute(workflow.id)}
        className='h-8 w-8 p-0'
      >
        <Play className='h-4 w-4' />
      </Button>
    </div>
  );
};

export const columns: ColumnDef<Workflow>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    }
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return format(new Date(date), "MMM d, yyyy");
    }
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
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
