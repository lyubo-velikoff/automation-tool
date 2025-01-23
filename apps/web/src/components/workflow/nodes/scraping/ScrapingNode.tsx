"use client";

import { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";
import { NodeData } from "@/components/workflow/config/nodeTypes";

interface ScrapingNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
}

function ScrapingNode({ id, data, selected }: ScrapingNodeProps) {
  console.log("ScrapingNode render:", { id, data });

  const handleConfigChange = useCallback(
    (key: keyof Omit<NodeData, "onConfigChange">, value: string) => {
      console.log("handleConfigChange called:", { key, value });
      console.log("Current data:", data);

      const onConfigChange = data.onConfigChange;
      if (!onConfigChange) {
        console.log("No onConfigChange function found");
        return;
      }

      // Create new data without onConfigChange
      const { onConfigChange: _, ...restData } = data;
      const newData = {
        ...restData,
        [key]: value
      };

      console.log("New data before update:", newData);
      onConfigChange(id || "", newData);
      console.log("Update completed");
    },
    [data, id]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("url", e.target.value);
    },
    [handleConfigChange]
  );

  const handleSelectorTypeChange = useCallback(
    (value: string) => {
      handleConfigChange("selectorType", value);
    },
    [handleConfigChange]
  );

  const handleSelectorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("selector", e.target.value);
    },
    [handleConfigChange]
  );

  const handleAttributeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("attribute", e.target.value);
    },
    [handleConfigChange]
  );

  const ScraperIcon = memo(() => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8' />
      <path d='M21 3v5h-5' />
    </svg>
  ));

  return (
    <div className={`${selected ? "ring-2 ring-primary" : ""}`}>
      <Card className='w-[300px]'>
        <CardHeader className='drag cursor-move'>
          <CardTitle className='flex items-center gap-2'>
            <ScraperIcon />
            Web Scraper
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 nodrag'>
          <div>
            <Label htmlFor='url'>URL</Label>
            <Input
              id='url'
              value={data.url || ""}
              onChange={handleUrlChange}
              placeholder='https://example.com'
            />
          </div>
          <div>
            <Label htmlFor='selectorType'>Selector Type</Label>
            <Select
              value={data.selectorType || "css"}
              onValueChange={handleSelectorTypeChange}
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
              onChange={handleSelectorChange}
              placeholder={
                data.selectorType === "xpath"
                  ? "//div[@class='content']"
                  : ".content"
              }
            />
          </div>
          <div>
            <Label htmlFor='attribute'>Attribute (optional)</Label>
            <Input
              id='attribute'
              value={data.attribute || ""}
              onChange={handleAttributeChange}
              placeholder='href'
            />
            <p className='text-sm text-muted-foreground mt-1'>
              Leave empty to get element text
            </p>
          </div>
        </CardContent>
        <Handle type='target' position={Position.Left} />
        <Handle type='source' position={Position.Right} />
      </Card>
    </div>
  );
}

export default memo(ScrapingNode);
