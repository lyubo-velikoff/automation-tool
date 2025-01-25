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
import { Textarea } from "@/components/ui/inputs/textarea";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { Button } from "@/components/ui/inputs/button";
import { useGmail } from "@/contexts/auth/GmailContext";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";

interface GmailActionNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
}

const GmailIcon = memo(() => (
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
    className='text-red-500'
  >
    <path d='M22 4H2v16h20V4zM2 8l10 6 10-6' />
  </svg>
));
GmailIcon.displayName = "GmailIcon";

interface NodeContentProps {
  data: NodeData;
  onLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubjectChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBodyChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const NodeContent = memo(
  ({
    data,
    onLabelChange,
    onToChange,
    onSubjectChange,
    onBodyChange
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
        <Label htmlFor='to'>To</Label>
        <Input
          id='to'
          value={data.to || ""}
          onChange={onToChange}
          placeholder='Recipient email'
        />
      </div>
      <div>
        <Label htmlFor='subject'>Subject</Label>
        <Input
          id='subject'
          value={data.subject || ""}
          onChange={onSubjectChange}
          placeholder='Email subject'
        />
      </div>
      <div>
        <Label htmlFor='body'>Body</Label>
        <Textarea
          id='body'
          value={data.body || ""}
          onChange={onBodyChange}
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
  )
);
NodeContent.displayName = "NodeContent";

function GmailActionNode({ id, data, selected, type }: GmailActionNodeProps) {
  const { isGmailConnected, connectGmail } = useGmail();

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

  if (!isGmailConnected) {
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
                  "hover:bg-muted/80 active:bg-muted/70"
                )}
              >
                <GmailIcon />
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
                <GmailIcon />
                Send Email
              </CardTitle>
              <CardDescription>
                Connect your Gmail account to send emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-4'>
                Connect your Gmail account to send emails
              </p>
              <Button onClick={connectGmail} className='w-full'>
                Connect Gmail
              </Button>
            </CardContent>
          </PopoverContent>
        </Popover>
        <Handle type='target' position={Position.Left} />
      </div>
    );
  }

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
                data.to && data.subject && "ring-2 ring-green-500/50"
              )}
            >
              <GmailIcon />
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
              <GmailIcon />
              Send Email
            </CardTitle>
            <CardDescription>
              Send an email using your Gmail account
            </CardDescription>
          </CardHeader>
          <NodeContent
            data={data}
            onLabelChange={handleLabelChange}
            onToChange={handleToChange}
            onSubjectChange={handleSubjectChange}
            onBodyChange={handleBodyChange}
          />
        </PopoverContent>
      </Popover>
      <Handle type='target' position={Position.Left} />
    </div>
  );
}

export default memo(GmailActionNode);
