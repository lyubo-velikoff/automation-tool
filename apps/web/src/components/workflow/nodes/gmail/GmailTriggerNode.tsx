"use client";

import { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { Button } from "@/components/ui/button";
import { useGmail } from "@/contexts/GmailContext";
import { cn } from "@/lib/utils";

interface GmailTriggerNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
}

function GmailTriggerNode({ id, data, selected, type }: GmailTriggerNodeProps) {
  console.log("GmailTriggerNode render:", { id, data });
  const { isGmailConnected, connectGmail } = useGmail();

  const handleConfigChange = useCallback(
    (key: keyof Omit<NodeData, "onConfigChange">, value: string) => {
      console.log("handleConfigChange called:", { key, value });
      console.log("Current data:", data);

      const { onConfigChange } = data;
      if (!onConfigChange) {
        console.log("No onConfigChange function found");
        return;
      }

      const newData = {
        ...data,
        [key]: value
      };

      console.log("New data before update:", newData);
      onConfigChange(id || "", newData);
      console.log("Update completed");
    },
    [data, id]
  );

  const GmailIcon = memo(() => (
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
      <path d='M22 4H2v16h20V4zM2 8l10 6 10-6' />
    </svg>
  ));
  GmailIcon.displayName = "GmailIcon";

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("fromFilter", e.target.value);
    },
    [handleConfigChange]
  );

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("subjectFilter", e.target.value);
    },
    [handleConfigChange]
  );

  const handleIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("pollingInterval", e.target.value);
    },
    [handleConfigChange]
  );

  if (!isGmailConnected) {
    return (
      <Card className='w-[300px]'>
        <CardHeader className='drag cursor-move'>
          <CardTitle className='flex items-center gap-2'>
            <GmailIcon />
            Email Trigger
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 nodrag'>
          <p className='text-sm text-muted-foreground'>
            Connect your Gmail account to monitor emails
          </p>
          <Button onClick={connectGmail} className='w-full'>
            Connect Gmail
          </Button>
        </CardContent>
        <Handle type='source' position={Position.Right} />
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "bg-background text-foreground",
        `${selected ? "ring-2 ring-primary" : ""}`
      )}
      data-testid={`node-${type?.toLowerCase()}`}
    >
      <div className='custom-drag-handle p-2 border-b bg-muted/50 cursor-move'>
        {data?.label || `${type} Node`}
      </div>
      <Card className='w-[300px]'>
        <CardHeader className='drag cursor-move'>
          <CardTitle className='flex items-center gap-2'>
            <GmailIcon />
            Email Trigger
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 nodrag'>
          <div>
            <Label htmlFor='fromFilter'>From</Label>
            <Input
              id='fromFilter'
              value={data.fromFilter || ""}
              onChange={handleFromChange}
              placeholder='Filter by sender'
            />
          </div>
          <div>
            <Label htmlFor='subjectFilter'>Subject contains</Label>
            <Input
              id='subjectFilter'
              value={data.subjectFilter || ""}
              onChange={handleSubjectChange}
              placeholder='Filter by subject'
            />
          </div>
          <div>
            <Label htmlFor='pollingInterval'>Check every (minutes)</Label>
            <Input
              id='pollingInterval'
              type='number'
              value={data.pollingInterval || "5"}
              onChange={handleIntervalChange}
              placeholder='Minutes'
            />
          </div>
        </CardContent>
        <Handle type='source' position={Position.Right} />
      </Card>
    </div>
  );
}

export default memo(GmailTriggerNode);
