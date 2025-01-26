"use client";

import { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
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

interface NodeData {
  label?: string;
  url?: string;
  selector?: string;
  selectorType?: "css" | "xpath";
  attributes?: string[];
  template?: string;
  onConfigChange?: (id: string, data: NodeData) => void;
}

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

function NodeContent({
  data,
  handleConfigChange
}: {
  data: NodeData;
  handleConfigChange: (
    key: keyof Omit<NodeData, "onConfigChange">,
    value: unknown
  ) => void;
}) {
  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex flex-col gap-2'>
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleConfigChange("label", e.target.value)
          }
          placeholder='Enter a label for this node'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>URL</Label>
        <Input
          value={data.url || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleConfigChange("url", e.target.value)
          }
          placeholder='Enter URL to scrape'
        />
        <p className='text-xs text-muted-foreground'>
          For Cursor forum, use: https://forum.cursor.com/
        </p>
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Selector</Label>
        <Input
          value={data.selector || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleConfigChange("selector", e.target.value)
          }
          placeholder='Enter CSS or XPath selector'
        />
        <p className='text-xs text-muted-foreground'>
          For Cursor forum, use: td.topic-list-item a.title
        </p>
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Selector Type</Label>
        <Select
          value={data.selectorType || "css"}
          onValueChange={(value: "css" | "xpath") =>
            handleConfigChange("selectorType", value)
          }
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
      <div className='flex flex-col gap-2'>
        <Label>Attributes</Label>
        <Select
          value={data.attributes?.join(",")}
          onValueChange={(value: string) =>
            handleConfigChange("attributes", value.split(","))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select attributes' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='text'>Text Content</SelectItem>
            <SelectItem value='href'>Link URL (href)</SelectItem>
            <SelectItem value='text,href'>Both Text and URL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Template</Label>
        <Input
          value={data.template || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleConfigChange("template", e.target.value)
          }
          placeholder='Enter template for results'
        />
        <p className='text-xs text-muted-foreground'>
          Example: [{"{text}"}]({"{href}"})
        </p>
      </div>
    </div>
  );
}

const defaultData: NodeData = {
  url: "https://forum.cursor.com/",
  selector: "td.topic-list-item a.title",
  selectorType: "css",
  attributes: ["text", "href"],
  template: "[{text}]({href})"
};

function WebScrapingNode({ id, data, selected, type }: WebScrapingNodeProps) {
  const handleConfigChange = useCallback(
    (key: keyof Omit<NodeData, "onConfigChange">, value: unknown) => {
      const { onConfigChange } = data;
      if (!onConfigChange) return;

      const newData: NodeData = {
        ...defaultData,
        ...data,
        [key]: value
      };

      if (!newData.selectorType) {
        newData.selectorType = "css";
      }

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
          <NodeContent data={data} handleConfigChange={handleConfigChange} />
        </PopoverContent>
      </Popover>
      <Handle type='target' position={Position.Left} />
      <Handle type='source' position={Position.Right} />
    </div>
  );
}

export default memo(WebScrapingNode);
