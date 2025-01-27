"use client";

import { memo, useCallback, useState } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { cn } from "@/lib/utils";
import { NodeData as GlobalNodeData } from "@/components/workflow/config/nodeTypes";

// Reuse existing selector config
interface SelectorConfig {
  selector: string;
  selectorType: "css" | "xpath";
  attributes: string[];
  name?: string;
  description?: string;
}

// Batch processing configuration
interface BatchConfig {
  batchSize: number;
  rateLimit: number; // requests per minute
}

// Extended node data for multi-URL scraping
interface MultiURLNodeData extends GlobalNodeData {
  urls: string[];
  selectors: SelectorConfig[];
  batchConfig: BatchConfig;
  template?: string;
  [key: string]: unknown;
}

interface MultiURLScrapingNodeProps {
  id?: string;
  data: MultiURLNodeData;
  selected?: boolean;
  type?: string;
  isConnectable: boolean;
}

const MultiURLScrapingIcon = memo(() => (
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
    <path d='M3 7V5c0-1.1.9-2 2-2h2' />
    <path d='M17 3h2c1.1 0 2 .9 2 2v2' />
    <path d='M21 17v2c0 1.1-.9 2-2 2h-2' />
    <path d='M7 21H5c-1.1 0-2-.9-2-2v-2' />
    <rect x='7' y='7' width='10' height='10' rx='1' />
  </svg>
));
MultiURLScrapingIcon.displayName = "MultiURLScrapingIcon";

function MultiURLScrapingNode({
  id,
  data,
  selected,
  type,
  isConnectable
}: MultiURLScrapingNodeProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigChange = useCallback(
    (key: keyof MultiURLNodeData, value: unknown) => {
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

  return (
    <div
      className={cn(
        "bg-background text-foreground relative",
        selected && "ring-2 ring-primary"
      )}
      data-testid={`node-${type?.toLowerCase()}`}
    >
      <Handle
        type='target'
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <Popover>
        <PopoverTrigger asChild>
          <div className='p-2 flex items-center justify-center'>
            <Card
              className={cn(
                "w-[64px] h-[64px] flex items-center justify-center bg-muted cursor-pointer transition-colors",
                "hover:bg-muted/80 active:bg-muted/70",
                data.urls?.length > 0 &&
                  data.selectors?.length > 0 &&
                  "ring-2 ring-blue-500/50"
              )}
            >
              <MultiURLScrapingIcon />
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
              <MultiURLScrapingIcon />
              Multi-URL Scraping
            </CardTitle>
            <CardDescription>
              Extract data from multiple websites using CSS or XPath selectors
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div>
              <Label>Node Label</Label>
              <Input
                value={data.label || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange("label", e.target.value)
                }
                placeholder='Node Label'
              />
            </div>
          </CardContent>
        </PopoverContent>
      </Popover>

      <Handle
        type='source'
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(MultiURLScrapingNode);
