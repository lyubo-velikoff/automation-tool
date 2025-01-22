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
}

export default function GmailTriggerNode({ id, data }: GmailTriggerNodeProps) {
  const { isGmailConnected, connectGmail } = useGmail();

  const handleConfigChange = (
    key: keyof Omit<NodeData, "onConfigChange">,
    value: string | number
  ) => {
    if (data.onConfigChange) {
      data.onConfigChange(id || "", {
        ...data,
        [key]: value
      });
    }
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
      <Card className='w-[300px]'>
        <CardHeader className='nodrag cursor-default'>
          <CardTitle className='flex items-center gap-2 drag cursor-move'>
            <GmailIcon />
            Gmail Trigger
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
    <Card className='w-[300px]'>
      <CardHeader className='nodrag cursor-default'>
        <CardTitle className='flex items-center gap-2 drag cursor-move'>
          <GmailIcon />
          Gmail Trigger
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 nodrag'>
        <div>
          <Label htmlFor='pollingInterval'>Check every (minutes)</Label>
          <Input
            id='pollingInterval'
            type='number'
            value={data.pollingInterval || 5}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleConfigChange("pollingInterval", parseInt(e.target.value))
            }
            min={1}
          />
        </div>
        <div>
          <Label htmlFor='fromFilter'>From (optional)</Label>
          <Input
            id='fromFilter'
            value={data.fromFilter || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleConfigChange("fromFilter", e.target.value)
            }
            placeholder='sender@example.com'
          />
        </div>
        <div>
          <Label htmlFor='subjectFilter'>Subject contains (optional)</Label>
          <Input
            id='subjectFilter'
            value={data.subjectFilter || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleConfigChange("subjectFilter", e.target.value)
            }
            placeholder='Important'
          />
        </div>
      </CardContent>
      <Handle type='source' position={Position.Right} />
    </Card>
  );
}
