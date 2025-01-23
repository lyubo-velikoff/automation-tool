"use client";

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
import { Plus } from "lucide-react";

export default function BoardPage() {
  return (
    <DashboardLayout>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Workflows</h1>
          <p className='text-sm text-muted-foreground'>
            Create and manage your automated workflows
          </p>
        </div>
        <Button className='gap-2'>
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
              <TableHead>Last Run</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className='font-medium'>Email Automation</TableCell>
              <TableCell>
                <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'>
                  Active
                </span>
              </TableCell>
              <TableCell>2 hours ago</TableCell>
              <TableCell>2 days ago</TableCell>
              <TableCell className='text-right'>
                <Button variant='ghost' size='sm'>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
