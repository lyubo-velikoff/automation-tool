"use client";

import { useState } from "react"
import { Mail, Sparkles } from "lucide-react"
import { useGmailAuth } from "@/hooks/auth/useGmailAuth"
import { useOpenAI } from "@/contexts/auth/OpenAIContext"
import { Button } from "@/components/ui/inputs/button"
import { Input } from "@/components/ui/inputs/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/layout/dialog"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/layout/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/data-display/separator"

export default function ConnectionsPage() {
  const { isGmailConnected, connectGmail } = useGmailAuth()
  const { isConnected: isOpenAIConnected, verifyKey, disconnect: disconnectOpenAI } = useOpenAI()
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenAISubmit = async () => {
    if (!apiKey.trim()) return
    
    setIsSubmitting(true)
    try {
      await verifyKey(apiKey)
      setOpenAISettingsOpen(false)
      setApiKey("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="space-y-8">
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
                        {isOpenAIConnected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isOpenAIConnected && (
                      <Button
                        variant="outline"
                        onClick={disconnectOpenAI}
                      >
                        Disconnect
                      </Button>
                    )}
                    <Button
                      variant={isOpenAIConnected ? "outline" : "default"}
                      onClick={() => setOpenAISettingsOpen(true)}
                    >
                      {isOpenAIConnected ? "Update Key" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={openAISettingsOpen} onOpenChange={setOpenAISettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI Configuration</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to enable AI features. You can find your API key in your OpenAI dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenAISettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOpenAISubmit}
              disabled={!apiKey.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
