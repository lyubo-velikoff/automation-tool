"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NodeData } from "@/components/workflow/config/nodeTypes";

interface GmailActionNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
}

export default function GmailActionNode({
  id,
  data,
  selected
}: GmailActionNodeProps) {
  const handleConfigChange = (
    key: keyof Omit<NodeData, "onConfigChange">,
    value: string
  ) => {
    if (!data.onConfigChange) return;

    // Create a new data object preserving all fields
    const newData = {
      ...data,
      [key]: value
    };

    // Call onConfigChange with the new data
    data.onConfigChange(id || "", newData);
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
              <path d='M22 4H2v16h20V4zM2 8l10 6 10-6' />
            </svg>
            Send Email
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 nodrag'>
          <div>
            <Label htmlFor='to'>To</Label>
            <Input
              id='to'
              value={data.to || ""}
              onChange={(e) => handleConfigChange("to", e.target.value)}
              placeholder='recipient@example.com'
            />
          </div>
          <div>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={data.subject || ""}
              onChange={(e) => handleConfigChange("subject", e.target.value)}
              placeholder='Email subject'
            />
          </div>
          <div>
            <Label htmlFor='body'>Body</Label>
            <Textarea
              id='body'
              value={data.body || ""}
              onChange={(e) => handleConfigChange("body", e.target.value)}
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
