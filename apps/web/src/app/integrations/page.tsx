"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/inputs/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/layout/card";
import { Mail, Sparkles } from "lucide-react";
import OpenAISettingsDialog from "@/components/ui/feedback/OpenAISettingsDialog";
import { useGmailAuth } from "@/hooks/auth/useGmailAuth";

export default function IntegrationsPage() {
  const [openAIDialogOpen, setOpenAIDialogOpen] = useState(false);
  const { isGmailConnected, connectGmail } = useGmailAuth();

  return (
    <DashboardLayout>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold tracking-tight'>Integrations</h1>
        <p className='text-sm text-muted-foreground'>
          Connect and manage your service integrations
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Gmail Integration */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Mail className='h-5 w-5' />
              <CardTitle>Gmail</CardTitle>
            </div>
            <CardDescription>
              Connect your Gmail account to send and receive emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant={isGmailConnected ? "outline" : "default"}
              onClick={connectGmail}
              className='w-full'
            >
              {isGmailConnected ? "Connected" : "Connect Gmail"}
            </Button>
          </CardContent>
        </Card>

        {/* OpenAI Integration */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5' />
              <CardTitle>OpenAI</CardTitle>
            </div>
            <CardDescription>
              Configure OpenAI API for AI-powered features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant='default'
              onClick={() => setOpenAIDialogOpen(true)}
              className='w-full'
            >
              Configure API Key
            </Button>
          </CardContent>
        </Card>
      </div>

      <OpenAISettingsDialog
        open={openAIDialogOpen}
        onOpenChange={setOpenAIDialogOpen}
        onSuccess={() => {
          // Handle successful connection
        }}
      />
    </DashboardLayout>
  );
}
