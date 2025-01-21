"use client";

import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

const commonEmails = [
  { value: "user1@example.com", label: "User 1" },
  { value: "user2@example.com", label: "User 2" }
];

const commonSubjects = [
  { value: "Meeting Summary", label: "Meeting Summary" },
  { value: "Weekly Report", label: "Weekly Report" }
];

export default function NodeSelector({ id, data, type }: NodeSelectorProps) {
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                className='w-full justify-between'
              >
                {data.to || "Select recipient..."}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[300px] p-0'>
              <Command>
                <CommandInput placeholder='Search email...' />
                <CommandEmpty>No email found.</CommandEmpty>
                <CommandGroup>
                  {commonEmails.map((email) => (
                    <CommandItem
                      key={email.value}
                      value={email.value}
                      onSelect={() => handleDataChange("to", email.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          data.to === email.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {email.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Input
            value={data.to || ""}
            onChange={(e) => handleDataChange("to", e.target.value)}
            placeholder='Or type email manually'
          />
        </div>
        <div className='space-y-2'>
          <Label>Subject</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                className='w-full justify-between'
              >
                {data.subject || "Select subject..."}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[300px] p-0'>
              <Command>
                <CommandInput placeholder='Search subject...' />
                <CommandEmpty>No subject found.</CommandEmpty>
                <CommandGroup>
                  {commonSubjects.map((subject) => (
                    <CommandItem
                      key={subject.value}
                      value={subject.value}
                      onSelect={() =>
                        handleDataChange("subject", subject.value)
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          data.subject === subject.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {subject.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
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
            onChange={(e) => handleDataChange("subjectFilter", e.target.value)}
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
