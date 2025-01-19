'use client';

import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

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
  { value: 'lyubo.velikoff@gmail.com', label: 'Lyubo Velikov' },
  // Add more common emails here
];

const commonSubjects = [
  { value: 'Test', label: 'Test Email' },
  { value: 'Daily Report', label: 'Daily Report' },
  { value: 'Weekly Update', label: 'Weekly Update' },
];

export default function NodeSelector({ id, data, type }: NodeSelectorProps) {
  const handleDataChange = useCallback(
    (key: string, value: string | number) => {
      if (data.onConfigChange) {
        data.onConfigChange(id, { ...data, [key]: value });
      }
    },
    [data, id]
  );

  const renderGmailAction = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm w-[300px]">
      <div className="space-y-4">
        <div>
          <label className="text-sm">Node Label:</label>
          <Input
            value={data.label || ''}
            onChange={(e) => handleDataChange('label', e.target.value)}
            placeholder="Enter node label"
          />
        </div>
        <div>
          <label className="text-sm">To:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {data.to || "Select recipient..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search email..." />
                <CommandEmpty>No email found.</CommandEmpty>
                <CommandGroup>
                  {commonEmails.map((email) => (
                    <CommandItem
                      key={email.value}
                      value={email.value}
                      onSelect={() => handleDataChange('to', email.value)}
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
            value={data.to || ''}
            onChange={(e) => handleDataChange('to', e.target.value)}
            placeholder="Or type email manually"
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm">Subject:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {data.subject || "Select subject..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search subject..." />
                <CommandEmpty>No subject found.</CommandEmpty>
                <CommandGroup>
                  {commonSubjects.map((subject) => (
                    <CommandItem
                      key={subject.value}
                      value={subject.value}
                      onSelect={() => handleDataChange('subject', subject.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          data.subject === subject.value ? "opacity-100" : "opacity-0"
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
            value={data.subject || ''}
            onChange={(e) => handleDataChange('subject', e.target.value)}
            placeholder="Or type subject manually"
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm">Body:</label>
          <Textarea
            value={data.body || ''}
            onChange={(e) => handleDataChange('body', e.target.value)}
            placeholder="Email content"
            rows={4}
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );

  const renderGmailTrigger = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm w-[300px]">
      <div className="space-y-4">
        <div>
          <label className="text-sm">Node Label:</label>
          <Input
            value={data.label || ''}
            onChange={(e) => handleDataChange('label', e.target.value)}
            placeholder="Enter node label"
          />
        </div>
        <div>
          <label className="text-sm">From:</label>
          <Input
            value={data.fromFilter || ''}
            onChange={(e) => handleDataChange('fromFilter', e.target.value)}
            placeholder="Filter by sender"
          />
        </div>
        <div>
          <label className="text-sm">Subject contains:</label>
          <Input
            value={data.subjectFilter || ''}
            onChange={(e) => handleDataChange('subjectFilter', e.target.value)}
            placeholder="Filter by subject"
          />
        </div>
        <div>
          <label className="text-sm">Check every:</label>
          <Input
            type="number"
            value={data.pollingInterval || '5'}
            onChange={(e) => handleDataChange('pollingInterval', e.target.value)}
            placeholder="Minutes"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );

  const renderOpenAICompletion = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm w-[300px]">
      <div className="space-y-4">
        <div>
          <label className="text-sm">Node Label:</label>
          <Input
            value={data.label || ''}
            onChange={(e) => handleDataChange('label', e.target.value)}
            placeholder="Enter node label"
          />
        </div>
        <div>
          <label className="text-sm">Prompt:</label>
          <Textarea
            value={data.prompt || ''}
            onChange={(e) => handleDataChange('prompt', e.target.value)}
            placeholder="Enter your prompt"
            rows={4}
          />
        </div>
        <div>
          <label className="text-sm">Model:</label>
          <Input
            value={data.model || 'gpt-3.5-turbo'}
            onChange={(e) => handleDataChange('model', e.target.value)}
            placeholder="Model name"
          />
        </div>
        <div>
          <label className="text-sm">Max Tokens:</label>
          <Input
            type="number"
            value={data.maxTokens || '100'}
            onChange={(e) => handleDataChange('maxTokens', e.target.value)}
            placeholder="Maximum tokens"
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );

  const renderScrapingNode = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm w-[300px]">
      <div className="font-semibold mb-2">Web Scraping</div>
      <div className="space-y-2">
        <div>
          <label className="text-sm">URL:</label>
          <Input
            value={data.url || ''}
            onChange={(e) => handleDataChange('url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="text-sm">Selector Type:</label>
          <select
            value={data.selectorType || 'css'}
            onChange={(e) => handleDataChange('selectorType', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="css">CSS Selector</option>
            <option value="xpath">XPath</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Selector:</label>
          <Input
            value={data.selector || ''}
            onChange={(e) => handleDataChange('selector', e.target.value)}
            placeholder={data.selectorType === 'css' ? '.article h1' : '//h1'}
          />
        </div>
        <div>
          <label className="text-sm">Attribute (Optional):</label>
          <Input
            value={data.attribute || ''}
            onChange={(e) => handleDataChange('attribute', e.target.value)}
            placeholder="href"
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );

  switch (type) {
    case 'GMAIL_ACTION':
      return renderGmailAction();
    case 'GMAIL_TRIGGER':
      return renderGmailTrigger();
    case 'OPENAI':
      return renderOpenAICompletion();
    case 'SCRAPING':
      return renderScrapingNode();
    default:
      return null;
  }
} 
