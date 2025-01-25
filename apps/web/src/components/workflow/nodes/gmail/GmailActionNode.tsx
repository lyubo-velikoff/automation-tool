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
import { useGmail } from "@/contexts/auth/GmailContext";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { Mail } from "lucide-react";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";

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

interface VariablePickerProps {
  nodeId: string;
  data: GmailActionNodeProps["data"];
}

function VariablePicker({ nodeId, data }: VariablePickerProps) {
  const { nodes } = useWorkflow();

  // Find nodes that can provide data (connected to this node)
  const sourceNodes = nodes.filter(
    (node) => node.type === "SCRAPING" || node.type === "OPENAI"
  );

  const handleInsertVariable = (variable: string) => {
    const newBody = data.body || "";
    const updatedBody = newBody + variable;

    data.onConfigChange?.(nodeId, {
      ...data,
      body: updatedBody
    });
  };

  return (
    <div className='p-2 space-y-2'>
      <h4 className='font-medium'>Insert Variable</h4>
      <div className='space-y-1'>
        {sourceNodes.map((node) => (
          <Button
            key={node.id}
            variant='ghost'
            className='w-full justify-start text-sm'
            onClick={() =>
              handleInsertVariable(
                `{{${node.data?.label || node.type}.results}}`
              )
            }
          >
            {node.data?.label || node.type}
          </Button>
        ))}
        {sourceNodes.length === 0 && (
          <p className='text-sm text-muted-foreground p-2'>
            No data source nodes connected. Add a Scraping or OpenAI node and
            connect it to this Gmail node.
          </p>
        )}
      </div>
    </div>
  );
}
VariablePicker.displayName = "VariablePicker";

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
          <div className='flex flex-col space-y-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm' className='w-full'>
                  Insert Variable
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-64' align='center'>
                <VariablePicker nodeId={id} data={data} />
              </PopoverContent>
            </Popover>
            <p className='text-xs text-muted-foreground text-center'>
              Add data from connected nodes to your email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
NodeContent.displayName = "NodeContent";

export default function GmailActionNode({ id, data }: GmailActionNodeProps) {
  const { isGmailConnected, connectGmail } = useGmail();

  if (!isGmailConnected) {
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
