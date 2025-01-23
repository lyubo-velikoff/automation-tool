"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { NodeData } from "@/components/workflow/config/nodeTypes";

interface ScrapingNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
}

export default function ScrapingNode({
  id,
  data,
  selected
}: ScrapingNodeProps) {
  console.log("ScrapingNode render:", { id, data });

  const handleConfigChange = (
    key: keyof Omit<NodeData, "onConfigChange">,
    value: string
  ) => {
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
  };

  return (
    <div className={`${selected ? "ring-2 ring-primary" : ""}`}>
      <Card className='w-[300px]'>
        <CardHeader className='drag cursor-move'>
          <CardTitle className='flex items-center gap-2'>
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
            Web Scraper
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 nodrag'>
          <div>
            <Label htmlFor='url'>URL</Label>
            <Input
              id='url'
              value={data.url || ""}
              onChange={(e) => handleConfigChange("url", e.target.value)}
              placeholder='https://example.com'
            />
          </div>
          <div>
            <Label htmlFor='selectorType'>Selector Type</Label>
            <Select
              value={data.selectorType || "css"}
              onValueChange={(value) =>
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
          <div>
            <Label htmlFor='selector'>Selector</Label>
            <Input
              id='selector'
              value={data.selector || ""}
              onChange={(e) => handleConfigChange("selector", e.target.value)}
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
              onChange={(e) => handleConfigChange("attribute", e.target.value)}
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
