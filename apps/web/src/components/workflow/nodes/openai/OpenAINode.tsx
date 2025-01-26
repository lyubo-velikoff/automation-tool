"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { NodeData } from "@/components/workflow/config/nodeTypes";
import { useOpenAI } from "@/contexts/auth/OpenAIContext";
import { Button } from "@/components/ui/inputs/button";
import { useState } from "react";

interface OpenAINodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
  isConnectable: boolean;
}

const OpenAIIcon = memo(() => (
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
    className='text-green-500'
  >
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
  </svg>
));
OpenAIIcon.displayName = "OpenAIIcon";

function OpenAINode({
  id,
  data,
  selected,
  type,
  isConnectable
}: OpenAINodeProps) {
  const { isConnected, verifyKey } = useOpenAI();
  const [apiKey, setApiKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleConfigChange = (field: string, value: string | number) => {
    data.onConfigChange?.(id || "", {
      ...data,
      [field]: value
    });
  };

  const handleConnect = async () => {
    setIsVerifying(true);
    try {
      await verifyKey(apiKey);
    } finally {
      setIsVerifying(false);
    }
  };

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
                data.prompt && "ring-2 ring-green-500/50"
              )}
            >
              <OpenAIIcon />
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
          className='w-[400px]'
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <OpenAIIcon />
              OpenAI
            </CardTitle>
            <CardDescription>
              Process text using OpenAI's language models
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            {!isConnected ? (
              <div className='space-y-4'>
                <div className='text-sm text-muted-foreground'>
                  Please connect your OpenAI account to use this node.
                </div>
                <div className='space-y-2'>
                  <Label>API Key</Label>
                  <Input
                    type='password'
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder='sk-...'
                  />
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={!apiKey || isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Connect OpenAI"}
                </Button>
              </div>
            ) : (
              <>
                <div className='space-y-2'>
                  <Label>Node Label</Label>
                  <Input
                    value={data?.label || ""}
                    onChange={(e) =>
                      handleConfigChange("label", e.target.value)
                    }
                    placeholder='Enter node label'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Prompt</Label>
                  <Textarea
                    value={data?.prompt || ""}
                    onChange={(e) =>
                      handleConfigChange("prompt", e.target.value)
                    }
                    placeholder='Enter your prompt'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Model</Label>
                  <Select
                    value={data?.model || "gpt-3.5-turbo"}
                    onValueChange={(value) =>
                      handleConfigChange("model", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a model' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='gpt-3.5-turbo'>
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value='gpt-4'>GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Max Tokens</Label>
                  <Input
                    type='number'
                    value={data?.maxTokens ?? 100}
                    onChange={(e) =>
                      handleConfigChange("maxTokens", parseInt(e.target.value))
                    }
                    placeholder='Enter max tokens'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Temperature</Label>
                  <Input
                    type='number'
                    value={data?.temperature ?? 0.7}
                    onChange={(e) =>
                      handleConfigChange(
                        "temperature",
                        parseFloat(e.target.value)
                      )
                    }
                    placeholder='Enter temperature'
                    step={0.1}
                    min={0}
                    max={2}
                  />
                </div>
              </>
            )}
          </CardContent>
        </PopoverContent>
      </Popover>
      <Handle
        type='target'
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type='source'
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(OpenAINode);
