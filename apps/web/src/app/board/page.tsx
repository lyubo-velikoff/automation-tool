"use client";

import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/data-display/table";
import { Button } from "@/components/ui/inputs/button";
import { Plus, Pencil, Play } from "lucide-react";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { format } from "date-fns";
import { Badge } from "@/components/ui/data-display/badge";
import { useWorkflowHandlers } from "@/hooks/useWorkflowHandlers";

interface Workflow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BoardPage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_WORKFLOWS);
  const { handleExecute } = useWorkflowHandlers();

  const handleEditWorkflow = (id: string) => {
    router.push(`/workflow/${id}`);
  };

  const handleCreateWorkflow = () => {
    // TODO: Implement workflow creation
    console.log("Create workflow");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='animate-pulse'>
          <div className='h-8 w-1/4 bg-muted rounded mb-4' />
          <div className='h-4 w-1/3 bg-muted rounded mb-8' />
          <div className='space-y-4'>
            <div className='h-10 bg-muted rounded' />
            <div className='h-10 bg-muted rounded' />
            <div className='h-10 bg-muted rounded' />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center'>
          <h2 className='text-lg font-semibold'>Error loading workflows</h2>
          <p className='text-sm text-muted-foreground'>{error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const workflows = (data?.workflows || []) as Workflow[];

  return (
    <DashboardLayout>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Workflows</h1>
          <p className='text-sm text-muted-foreground'>
            Create and manage your automated workflows
          </p>
        </div>
        <Button onClick={handleCreateWorkflow} className='gap-2'>
          <Plus className='h-4 w-4' />
          New Workflow
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell className='font-medium'>{workflow.name}</TableCell>
                <TableCell>
                  <Badge variant={workflow.is_active ? "default" : "secondary"}>
                    {workflow.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(workflow.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(workflow.updated_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className='text-right space-x-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleEditWorkflow(workflow.id)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleExecute(workflow.id)}
                  >
                    <Play className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {workflows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-8'>
                  <p className='text-muted-foreground'>No workflows found</p>
                  <Button
                    variant='link'
                    onClick={handleCreateWorkflow}
                    className='mt-2'
                  >
                    Create your first workflow
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
