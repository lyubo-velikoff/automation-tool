"use client";

import { memo } from "react";
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
import { Button } from "@/components/ui/inputs/button";
import { useConnections } from "@/contexts/connections/ConnectionsContext";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { Mail } from "lucide-react";

interface GmailNodeData {
  to?: string;
  subject?: string;
  body?: string;
  label?: string;
  onConfigChange?: (nodeId: string, data: GmailNodeData) => void;
}

interface GmailActionNodeProps {
  id: string;
  data: GmailNodeData;
}

const GmailIcon = memo(() => <Mail className='h-4 w-4' />);
GmailIcon.displayName = "GmailIcon";

function NodeContent({ id, data }: GmailActionNodeProps) {
  return (
    <div className='p-3'>
      <div className='space-y-3'>
        <div>
          <Label>Label</Label>
          <Input
            value={data.label || ""}
            onChange={(e) =>
              data.onConfigChange?.(id, { ...data, label: e.target.value })
            }
            placeholder='Node Label'
          />
        </div>
        <div>
          <Label>To</Label>
          <Input
            value={data.to || ""}
            onChange={(e) =>
              data.onConfigChange?.(id, { ...data, to: e.target.value })
            }
            placeholder='recipient@example.com'
          />
        </div>
        <div>
          <Label>Subject</Label>
          <Input
            value={data.subject || ""}
            onChange={(e) =>
              data.onConfigChange?.(id, { ...data, subject: e.target.value })
            }
            placeholder='Email subject'
          />
        </div>
        <div>
          <Label>Body</Label>
          <Textarea
            value={data.body || ""}
            onChange={(e) =>
              data.onConfigChange?.(id, { ...data, body: e.target.value })
            }
            placeholder='Email body'
            className='min-h-[100px] mb-2'
          />
        </div>
      </div>
    </div>
  );
}
NodeContent.displayName = "NodeContent";

export default function GmailActionNode({ id, data }: GmailActionNodeProps) {
  const { connections, connect } = useConnections();

  const handleConnect = async () => {
    await connect("gmail");
  };

  if (!connections.gmail.isConnected) {
    return (
      <div
        className={cn(
          "bg-background text-foreground relative",
          data.to && data.subject && "ring-2 ring-green-500/50"
        )}
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
              <Button onClick={handleConnect} className='w-full'>
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
        data.to && data.subject && "ring-2 ring-green-500/50"
      )}
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
          <NodeContent id={id} data={data} />
        </PopoverContent>
      </Popover>
      <Handle type='target' position={Position.Left} />
    </div>
  );
}
GmailActionNode.displayName = "GmailActionNode";
