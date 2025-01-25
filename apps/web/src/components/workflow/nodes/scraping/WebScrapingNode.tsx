"use client";

import { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";

interface WebScrapingNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
}

const WebScrapingIcon = memo(() => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='32'
    height='32'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-blue-500'
  >
    <path d='M14 7h6.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 1 23 9.828V19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 1 12 5v2h2z' />
    <path d='M3 15h18' />
  </svg>
));
WebScrapingIcon.displayName = "WebScrapingIcon";

interface NodeContentProps {
  data: NodeData;
  onLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectorTypeChange: (value: string) => void;
  onAttributeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NodeContent = memo(
  ({
    data,
    onLabelChange,
    onUrlChange,
    onSelectorChange,
    onSelectorTypeChange,
    onAttributeChange
  }: NodeContentProps) => (
    <CardContent className='flex flex-col gap-4 nodrag'>
      <div className='space-y-2'>
        <Label>Node Label</Label>
        <Input
          value={data.label || ""}
          onChange={onLabelChange}
          placeholder='Enter node label'
        />
      </div>
      <div>
        <Label htmlFor='url'>URL</Label>
        <Input
          id='url'
          value={data.url || ""}
          onChange={onUrlChange}
          placeholder='https://example.com'
        />
      </div>
      <div>
        <Label htmlFor='selectorType'>Selector Type</Label>
        <Select
          value={data.selectorType || "css"}
          onValueChange={onSelectorTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='css'>CSS</SelectItem>
            <SelectItem value='xpath'>XPath</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor='selector'>Selector</Label>
        <Input
          id='selector'
          value={data.selector || ""}
          onChange={onSelectorChange}
          placeholder={
            data.selectorType === "xpath"
              ? "//div[@class='example']"
              : ".example"
          }
        />
      </div>
      <div>
        <Label htmlFor='attribute'>Attribute (optional)</Label>
        <Input
          id='attribute'
          value={data.attribute || ""}
          onChange={onAttributeChange}
          placeholder='href, src, etc.'
        />
      </div>
    </CardContent>
  )
);
NodeContent.displayName = "NodeContent";

function WebScrapingNode({ id, data, selected, type }: WebScrapingNodeProps) {
  const handleConfigChange = useCallback(
    (key: keyof Omit<NodeData, "onConfigChange">, value: string) => {
      const { onConfigChange } = data;
      if (!onConfigChange) return;

      const newData = {
        ...data,
        [key]: value
      };

      onConfigChange(id || "", newData);
    },
    [data, id]
  );

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("label", e.target.value);
    },
    [handleConfigChange]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("url", e.target.value);
    },
    [handleConfigChange]
  );

  const handleSelectorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("selector", e.target.value);
    },
    [handleConfigChange]
  );

  const handleSelectorTypeChange = useCallback(
    (value: string) => {
      handleConfigChange("selectorType", value);
    },
    [handleConfigChange]
  );

  const handleAttributeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("attribute", e.target.value);
    },
    [handleConfigChange]
  );

  return (
    <div
      className={cn(
        "bg-background text-foreground relative",
        selected && "ring-2 ring-primary"
      )}
      data-testid={`node-${type?.toLowerCase()}`}
    >
      <Popover>
        <PopoverTrigger asChild>
          <div className='p-2 flex items-center justify-center'>
            <Card
              className={cn(
                "w-[64px] h-[64px] flex items-center justify-center bg-muted cursor-pointer transition-colors",
                "hover:bg-muted/80 active:bg-muted/70",
                data.url && data.selector && "ring-2 ring-blue-500/50"
              )}
            >
              <WebScrapingIcon />
              {data.label && (
                <div className='absolute -bottom-6 text-xs text-gray-600 font-medium'>
                  {data.label}
                </div>
              )}
            </Card>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side='right'
          align='start'
          alignOffset={-240}
          sideOffset={12}
          className='w-[300px]'
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <WebScrapingIcon />
              Web Scraping
            </CardTitle>
            <CardDescription>
              Extract data from websites using CSS or XPath selectors
            </CardDescription>
          </CardHeader>
          <NodeContent
            data={data}
            onLabelChange={handleLabelChange}
            onUrlChange={handleUrlChange}
            onSelectorChange={handleSelectorChange}
            onSelectorTypeChange={handleSelectorTypeChange}
            onAttributeChange={handleAttributeChange}
          />
        </PopoverContent>
      </Popover>
      <Handle type='target' position={Position.Left} />
      <Handle type='source' position={Position.Right} />
    </div>
  );
}

export default memo(WebScrapingNode);
