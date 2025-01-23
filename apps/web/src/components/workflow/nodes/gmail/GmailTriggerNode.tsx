"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { Button } from "@/components/ui/button";
import { useGmail } from "@/contexts/GmailContext";

interface GmailTriggerNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
}

export default function GmailTriggerNode({
  id,
  data,
  selected
}: GmailTriggerNodeProps) {
  console.log("GmailTriggerNode render:", { id, data });
  const { isGmailConnected, connectGmail } = useGmail();

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

  const GmailIcon = () => (
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
  );

  if (!isGmailConnected) {
    return (
      <div className={`${selected ? "ring-2 ring-primary" : ""}`}>
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
      </div>
    );
  }

  return (
    <div className={`${selected ? "ring-2 ring-primary" : ""}`}>
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
              onChange={(e) => handleConfigChange("fromFilter", e.target.value)}
              placeholder='Filter by sender'
            />
          </div>
          <div>
            <Label htmlFor='subjectFilter'>Subject contains</Label>
            <Input
              id='subjectFilter'
              value={data.subjectFilter || ""}
              onChange={(e) =>
                handleConfigChange("subjectFilter", e.target.value)
              }
              placeholder='Filter by subject'
            />
          </div>
          <div>
            <Label htmlFor='pollingInterval'>Check every (minutes)</Label>
            <Input
              id='pollingInterval'
              type='number'
              value={data.pollingInterval || "5"}
              onChange={(e) =>
                handleConfigChange("pollingInterval", e.target.value)
              }
              placeholder='Minutes'
            />
          </div>
        </CardContent>
        <Handle type='source' position={Position.Right} />
      </Card>
    </div>
  );
}
