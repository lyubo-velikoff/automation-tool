"use client";

import { useQuery } from "@apollo/client";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { DataTable } from "@/components/workflow/table/data-table";
import { columns } from "@/components/workflow/table/columns";
import { CreateWorkflowDialog } from "@/components/workflow/table/CreateWorkflowDialog";

export default function WorkflowsPage() {
  const { loading, error, data } = useQuery(GET_WORKFLOWS);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-1/4 bg-muted rounded' />
          <div className='h-4 w-1/3 bg-muted rounded' />
          <div className='space-y-3 mt-8'>
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
        <div className='text-center py-8'>
          <h2 className='text-lg font-semibold'>Error loading workflows</h2>
          <p className='text-sm text-muted-foreground mt-2'>{error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const workflows = data?.workflows || [];

  return (
    <DashboardLayout>
      <div>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Workflows</h1>
            <p className='text-sm text-muted-foreground'>
              Create and manage your automated workflows
            </p>
          </div>
          <CreateWorkflowDialog />
        </div>

        <DataTable columns={columns} data={workflows} />
      </div>
    </DashboardLayout>
  );
}
