"use client";

import { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { cn } from "@/lib/utils";

interface GmailActionNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
}

function GmailActionNode({ id, data, selected, type }: GmailActionNodeProps) {
  console.log("GmailActionNode render:", { id, data });

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

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("to", e.target.value);
    },
    [handleConfigChange]
  );

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleConfigChange("subject", e.target.value);
    },
    [handleConfigChange]
  );

  const handleBodyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleConfigChange("body", e.target.value);
    },
    [handleConfigChange]
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
            Send Email
          </CardTitle>
          <CardDescription>
            Send an email using your Gmail account
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 nodrag'>
          <div>
            <Label htmlFor='to'>To</Label>
            <Input
              id='to'
              value={data.to || ""}
              onChange={handleToChange}
              placeholder='Recipient email'
            />
          </div>
          <div>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={data.subject || ""}
              onChange={handleSubjectChange}
              placeholder='Email subject'
            />
          </div>
          <div>
            <Label htmlFor='body'>Body</Label>
            <Textarea
              id='body'
              value={data.body || ""}
              onChange={handleBodyChange}
              placeholder='Email body'
              rows={4}
            />
            <p className='text-sm text-muted-foreground mt-1'>
              Supports variables: {"{{"}
              <span>variable_name</span>
              {"}}"}
            </p>
          </div>
        </CardContent>
        <Handle type='target' position={Position.Left} />
      </Card>
    </div>
  );
}

export default memo(GmailActionNode);
