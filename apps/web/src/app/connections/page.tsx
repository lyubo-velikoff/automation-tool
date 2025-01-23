"use client";

import { useState } from "react";
import { Header } from "@/components/ui/navigation/Header";
import { useGmailAuth } from "@/hooks/auth/useGmailAuth";
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

export default function ConnectionsPage() {
  const { isGmailConnected, connectGmail } = useGmailAuth();
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);

  return (
    <>
      <Header />
      <div className='flex min-h-[calc(100vh-3.5rem)] bg-muted/50'>
        <div className='container max-w-2xl mx-auto py-10 px-4 md:px-6'>
          <div className='grid gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>Service Connections</CardTitle>
                <CardDescription>
                  Configure your service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between space-x-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <Mail className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium'>Gmail</h3>
                      <p className='text-sm text-muted-foreground'>
                        {isGmailConnected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isGmailConnected ? "outline" : "default"}
                    onClick={connectGmail}
                  >
                    {isGmailConnected ? "Reconnect" : "Connect"}
                  </Button>
                </div>

                <div className='flex items-center justify-between space-x-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <Sparkles className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium'>OpenAI</h3>
                      <p className='text-sm text-muted-foreground'>
                        Configure API key
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    onClick={() => setOpenAISettingsOpen(true)}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
