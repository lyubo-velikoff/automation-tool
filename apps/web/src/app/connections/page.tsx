"use client";

import { useState } from "react"
import { Mail, Sparkles } from "lucide-react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { useGmailAuth } from "@/hooks/auth/useGmailAuth"
import { Button } from "@/components/ui/inputs/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card"
import OpenAISettingsDialog from "@/components/ui/feedback/OpenAISettingsDialog"

export default function ConnectionsPage() {
  const { isGmailConnected, connectGmail } = useGmailAuth()
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false)

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-8 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Connections</h1>
            <p className="text-sm text-muted-foreground">
              Manage your integrations and connections.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Connections</CardTitle>
            <CardDescription>
              Configure your service integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Gmail</h3>
                  <p className="text-sm text-muted-foreground">
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

            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">OpenAI</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure API key
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setOpenAISettingsOpen(true)}
              >
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <OpenAISettingsDialog
        open={openAISettingsOpen}
        onOpenChange={setOpenAISettingsOpen}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </SidebarLayout>
  )
}
