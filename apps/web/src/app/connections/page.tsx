"use client";

import { useState } from "react"
import { Mail, Sparkles } from "lucide-react"
import { useConnections } from "@/contexts/connections/ConnectionsContext"
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
import { SERVICES, ServiceType } from "@/types/services"

export default function ConnectionsPage() {
  const { connections, connect, disconnect, getServiceConfig } = useConnections()
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConnect = async (service: ServiceType) => {
    const config = getServiceConfig(service)
    if (config.type === 'apiKey') {
      setSelectedService(service)
    } else {
      await connect(service)
    }
  }

  const handleApiKeySubmit = async () => {
    if (!selectedService || !apiKey.trim()) return
    
    setIsSubmitting(true)
    try {
      await connect(selectedService, { apiKey })
      setSelectedService(null)
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
                {Object.entries(SERVICES).map(([key, service]) => (
                  <div key={key} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {connections[key as ServiceType].isConnected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {connections[key as ServiceType].isConnected && (
                        <Button
                          variant="outline"
                          onClick={() => disconnect(key as ServiceType)}
                        >
                          Disconnect
                        </Button>
                      )}
                      <Button
                        variant={connections[key as ServiceType].isConnected ? "outline" : "default"}
                        onClick={() => handleConnect(key as ServiceType)}
                      >
                        {connections[key as ServiceType].isConnected ? "Update" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={Boolean(selectedService)} onOpenChange={() => setSelectedService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedService && getServiceConfig(selectedService).name} Configuration
            </DialogTitle>
            <DialogDescription>
              {selectedService && getServiceConfig(selectedService).description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedService && getServiceConfig(selectedService).requiredFields?.apiKey && (
              <Input
                type="password"
                placeholder={getServiceConfig(selectedService).requiredFields.apiKey.placeholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedService(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApiKeySubmit}
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
