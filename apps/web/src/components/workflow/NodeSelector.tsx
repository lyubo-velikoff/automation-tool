"use client";

import { useCallback, useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface NodeData {
  label?: string;
  to?: string;
  subject?: string;
  body?: string;
  fromFilter?: string;
  subjectFilter?: string;
  pollingInterval?: string | number;
  prompt?: string;
  model?: string;
  maxTokens?: string | number;
  onConfigChange?: (nodeId: string, data: NodeData) => void;
  url?: string;
  selectorType?: string;
  selector?: string;
  attribute?: string;
}

interface NodeSelectorProps {
  id: string;
  data: NodeData;
  type: string;
}

export default function NodeSelector({ id, data, type }: NodeSelectorProps) {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  useEffect(() => {
    checkGmailConnection();

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "GMAIL_CONNECTED") {
        checkGmailConnection();
      } else if (event.data?.type === "GMAIL_ERROR") {
        toast({
          title: "Connection Failed",
          description: event.data.error,
          variant: "destructive"
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Check if auth window is still open periodically
    const checkAuthWindow = setInterval(() => {
      if (authWindow && authWindow.closed) {
        setAuthWindow(null);
      }
    }, 1000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(checkAuthWindow);
      // Close auth window if component unmounts
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    };
  }, [authWindow]);

  const checkGmailConnection = async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.provider_token) {
        setIsGmailConnected(false);
        return;
      }

      // Verify the token by making a test API call
      const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/profile",
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`
          }
        }
      );

      if (!response.ok) {
        console.error("Gmail connection needs refresh:", await response.text());
        setIsGmailConnected(false);
        toast({
          title: "Gmail Connection Required",
          description: "Please connect your Gmail account to use this feature",
          variant: "default"
        });
        return;
      }

      setIsGmailConnected(true);
      toast({
        title: "Connected",
        description: "Gmail connection successful"
      });
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      setIsGmailConnected(false);
      // Don't show error toast on initial load
      if (isGmailConnected) {
        toast({
          title: "Gmail Connection Lost",
          description: "Please reconnect your Gmail account",
          variant: "default"
        });
      }
    }
  };

  const handleGmailConnect = () => {
    // Close any existing auth windows
    if (authWindow && !authWindow.closed) {
      authWindow.close();
    }

    // Calculate popup position
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    const popup = window.open(
      "/auth/gmail-popup",
      "gmail-auth",
      `width=${width},height=${height},left=${left},top=${top},popup=true`
    );

    if (popup) {
      setAuthWindow(popup);
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to connect Gmail.",
        variant: "destructive"
      });
    }
  };

  const handleDataChange = useCallback(
    (key: string, value: string | number) => {
      if (data.onConfigChange) {
        const newData = {
          ...data,
          [key]: value,
          label: key === "label" ? String(value) : data.label || `${type} Node`
        };
        data.onConfigChange(id, newData);
      }
    },
    [data, id, type]
  );

  const renderGmailAction = () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle className='text-base'>Send Email</CardTitle>
        <CardDescription>Configure email sending settings</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!isGmailConnected ? (
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>
              Connect your Gmail account to send emails
            </p>
            <Button onClick={handleGmailConnect} className='w-full'>
              Connect Gmail
            </Button>
          </div>
        ) : (
          <>
            <div className='space-y-2'>
              <Label>Node Label</Label>
              <Input
                value={data.label || ""}
                onChange={(e) => handleDataChange("label", e.target.value)}
                placeholder='Enter node label'
              />
            </div>
            <div className='space-y-2'>
              <Label>To</Label>
              <Input
                value={data.to || ""}
                onChange={(e) => handleDataChange("to", e.target.value)}
                placeholder='Or type email manually'
              />
            </div>
            <div className='space-y-2'>
              <Label>Subject</Label>
              <Input
                value={data.subject || ""}
                onChange={(e) => handleDataChange("subject", e.target.value)}
                placeholder='Or type subject manually'
              />
            </div>
            <div className='space-y-2'>
              <Label>Body</Label>
              <Textarea
                value={data.body || ""}
                onChange={(e) => handleDataChange("body", e.target.value)}
                placeholder='Email content'
                rows={4}
              />
            </div>
          </>
        )}
      </CardContent>
      <Handle
        type='target'
        position={Position.Left}
        data-testid='target-handle'
      />
      <Handle
        type='source'
        position={Position.Right}
        data-testid='source-handle'
      />
    </Card>
  );

  const renderGmailTrigger = () => (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Email Trigger</CardTitle>
        <CardDescription>Configure email trigger settings</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!isGmailConnected ? (
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>
              Connect your Gmail account to monitor emails
            </p>
            <Button onClick={handleGmailConnect} className='w-full'>
              Connect Gmail
            </Button>
          </div>
        ) : (
          <>
            <div className='space-y-2'>
              <Label>Node Label</Label>
              <Input
                value={data.label || ""}
                onChange={(e) => handleDataChange("label", e.target.value)}
                placeholder='Enter node label'
              />
            </div>
            <div className='space-y-2'>
              <Label>From</Label>
              <Input
                value={data.fromFilter || ""}
                onChange={(e) => handleDataChange("fromFilter", e.target.value)}
                placeholder='Filter by sender'
              />
            </div>
            <div className='space-y-2'>
              <Label>Subject contains</Label>
              <Input
                value={data.subjectFilter || ""}
                onChange={(e) =>
                  handleDataChange("subjectFilter", e.target.value)
                }
                placeholder='Filter by subject'
              />
            </div>
            <div className='space-y-2'>
              <Label>Check every (minutes)</Label>
              <Input
                type='number'
                value={data.pollingInterval || "5"}
                onChange={(e) =>
                  handleDataChange("pollingInterval", e.target.value)
                }
                placeholder='Minutes'
              />
            </div>
          </>
        )}
      </CardContent>
      <Handle
        type='source'
        position={Position.Right}
        data-testid='source-handle'
      />
    </Card>
  );

  const renderOpenAICompletion = () => (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>OpenAI Completion</CardTitle>
        <CardDescription>Configure AI completion settings</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>Node Label</Label>
          <Input
            value={data.label || ""}
            onChange={(e) => handleDataChange("label", e.target.value)}
            placeholder='Enter node label'
          />
        </div>
        <div className='space-y-2'>
          <Label>Prompt</Label>
          <Textarea
            value={data.prompt || ""}
            onChange={(e) => handleDataChange("prompt", e.target.value)}
            placeholder='Enter your prompt'
            rows={4}
          />
        </div>
        <div className='space-y-2'>
          <Label>Model</Label>
          <Input
            value={data.model || "gpt-3.5-turbo"}
            onChange={(e) => handleDataChange("model", e.target.value)}
            placeholder='Model name'
          />
        </div>
        <div className='space-y-2'>
          <Label>Max Tokens</Label>
          <Input
            type='number'
            value={data.maxTokens || "100"}
            onChange={(e) => handleDataChange("maxTokens", e.target.value)}
            placeholder='Maximum tokens'
          />
        </div>
      </CardContent>
      <Handle
        type='target'
        position={Position.Left}
        data-testid='target-handle'
      />
      <Handle
        type='source'
        position={Position.Right}
        data-testid='source-handle'
      />
    </Card>
  );

  const renderScrapingNode = () => (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Web Scraping</CardTitle>
        <CardDescription>Configure web scraping settings</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>Node Label</Label>
          <Input
            value={data.label || ""}
            onChange={(e) => handleDataChange("label", e.target.value)}
            placeholder='Enter node label'
          />
        </div>
        <div className='space-y-2'>
          <Label>URL</Label>
          <Input
            value={data.url || ""}
            onChange={(e) => handleDataChange("url", e.target.value)}
            placeholder='https://example.com'
          />
        </div>
        <div className='space-y-2'>
          <Label>Selector Type</Label>
          <select
            value={data.selectorType || "css"}
            onChange={(e) => handleDataChange("selectorType", e.target.value)}
            className='w-full border rounded p-2'
          >
            <option value='css'>CSS Selector</option>
            <option value='xpath'>XPath</option>
          </select>
        </div>
        <div className='space-y-2'>
          <Label>Selector</Label>
          <Input
            value={data.selector || ""}
            onChange={(e) => handleDataChange("selector", e.target.value)}
            placeholder={data.selectorType === "css" ? ".article h1" : "//h1"}
          />
        </div>
        <div className='space-y-2'>
          <Label>Attribute (Optional)</Label>
          <Input
            value={data.attribute || ""}
            onChange={(e) => handleDataChange("attribute", e.target.value)}
            placeholder='href'
          />
        </div>
      </CardContent>
      <Handle
        type='target'
        position={Position.Left}
        data-testid='target-handle'
      />
      <Handle
        type='source'
        position={Position.Right}
        data-testid='source-handle'
      />
    </Card>
  );

  switch (type) {
    case "GMAIL_ACTION":
      return renderGmailAction();
    case "GMAIL_TRIGGER":
      return renderGmailTrigger();
    case "OPENAI":
      return renderOpenAICompletion();
    case "SCRAPING":
      return renderScrapingNode();
    default:
      return null;
  }
}
