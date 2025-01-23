"use client";

import { useQuery } from "@apollo/client";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/inputs/button";
import { Plus } from "lucide-react";
import { GET_WORKFLOWS } from "@/graphql/queries";
import { DataTable } from "@/components/workflow/table/data-table";
import { columns } from "@/components/workflow/table/columns";

export default function BoardPage() {
  const { loading, error, data } = useQuery(GET_WORKFLOWS);

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

  const workflows = data?.workflows || [];

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

      <DataTable columns={columns} data={workflows} />
    </DashboardLayout>
  );
}
