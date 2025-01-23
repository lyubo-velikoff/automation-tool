"use client";

import { useCallback } from "react";
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
import { useGmailAuth } from "@/hooks/useGmailAuth";
import GmailActionNode from "./nodes/gmail/GmailActionNode";

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
  const { isGmailConnected, connectGmail } = useGmailAuth();

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
    data && <GmailActionNode  id={id} data={data} />
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
            <Button onClick={connectGmail} className='w-full'>
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
