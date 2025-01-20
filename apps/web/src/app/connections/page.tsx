'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { WorkflowLoadingSkeleton } from '@/components/workflow/loading-skeleton';
import OpenAISettingsDialog from '@/components/workflow/OpenAISettingsDialog';
import ConnectionStatus from '@/components/workflow/ConnectionStatus';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConnectionsPage() {
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);
  const { session, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  if (!session) {
    router.replace('/');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Service Connections</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <ConnectionStatus onOpenAISettings={() => setOpenAISettingsOpen(true)} />
              <Button 
                onClick={() => setOpenAISettingsOpen(true)}
                variant="outline"
              >
                Configure OpenAI Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Future service connections can be added here */}
        <Card>
          <CardHeader>
            <CardTitle>Gmail Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Connect your Gmail account to use Gmail triggers and actions.</p>
            <Button variant="outline">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
} 
