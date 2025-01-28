"use client";

import { memo, useCallback, useState, useMemo } from "react";
import { Handle, Position } from "reactflow";
import dynamic from "next/dynamic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Button } from "@/components/ui/inputs/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { cn } from "@/lib/utils";
import { NodeData as GlobalNodeData } from "@/components/workflow/config/nodeTypes";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/data-display/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";
import { Card as SelectorCard } from "@/components/ui/layout/card";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/data-display/separator";
import { Badge } from "@/components/ui/data-display/badge";
import { SelectorEditor } from "./components/SelectorEditor";

interface NodeData {
  label: string;
  url: string;
  selectors: SelectorConfig[];
  template: string;
  pollingInterval?: number | null;
  fromFilter?: string | null;
  subjectFilter?: string | null;
  to?: string | null;
  subject?: string | null;
  body?: string | null;
  prompt?: string | null;
  model?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
  onConfigChange?: (data: NodeData) => void;
}

interface GraphQLNodeData extends Omit<NodeData, "onConfigChange"> {
  __typename?: string;
  [key: string]: any;
}

interface WebScrapingNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
  isConnectable: boolean;
}

const WebScrapingIcon = memo(() => (
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
    className='text-blue-500'
  >
    <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
    <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
  </svg>
));
WebScrapingIcon.displayName = "WebScrapingIcon";

// Convert incoming GraphQL data to our UI format
function convertIncomingData(data: GraphQLNodeData): NodeData {
  return {
    ...data,
    selectors: data.selectors || [
      {
        selector: "",
        selectorType: "css" as const,
        attributes: ["text"],
        name: data.label || "Content"
      }
    ],
    template: data.template || "{{text}}"
  };
}

// Dynamically import Popover components
const Popover = dynamic(
  () => import("@/components/ui/overlays/popover").then((mod) => mod.Popover),
  {
    ssr: false
  }
);
const PopoverContent = dynamic(
  () =>
    import("@/components/ui/overlays/popover").then(
      (mod) => mod.PopoverContent
    ),
  {
    ssr: false
  }
);
const PopoverTrigger = dynamic(
  () =>
    import("@/components/ui/overlays/popover").then(
      (mod) => mod.PopoverTrigger
    ),
  {
    ssr: false
  }
);

function WebScrapingNode({
  id,
  data,
  selected,
  type,
  isConnectable
}: WebScrapingNodeProps) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigChange = useCallback(
    (key: string, value: any) => {
      if (!data.onConfigChange) return;

      const newData = { ...data };
      if (key === "selectors") {
        newData.selectors = value;
      } else {
        (newData as any)[key] = value;
      }

      data.onConfigChange(newData);
    },
    [data]
  );

  // Convert incoming data for UI only when needed
  const nodeData = useMemo(
    () => convertIncomingData(data as GraphQLNodeData),
    [data]
  );

  const handleAddSelector = useCallback(() => {
    const selectors = [...(nodeData.selectors || [])];
    selectors.push({
      selector: "",
      selectorType: "css",
      attributes: ["text"],
      name: `Selector ${selectors.length + 1}`
    });
    handleConfigChange("selectors", selectors);
  }, [nodeData.selectors, handleConfigChange]);

  const handleRemoveSelector = useCallback(
    (index: number) => {
      const selectors = [...(nodeData.selectors || [])];
      selectors.splice(index, 1);
      handleConfigChange("selectors", selectors);
    },
    [nodeData.selectors, handleConfigChange]
  );

  const handleSelectorTest = async (index: number) => {
    setIsLoading(true);
    try {
      const selector = nodeData.selectors[index];
      const response = await fetch("http://localhost:4000/api/test-selector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: nodeData.url,
          selector: selector.selector,
          selectorType: selector.selectorType,
          attributes: selector.attributes
        })
      });

      const result = (await response.json()) as {
        success: boolean;
        results: Array<{ text?: string; href?: string }>;
        error?: string;
      };
      if (result.success) {
        setTestResults(
          result.results.map((r) =>
            nodeData.template
              ? nodeData.template
                  .replace(/{{text}}/g, r.text || "")
                  .replace(/{{href}}/g, r.href || "")
              : JSON.stringify(r)
          )
        );
      } else {
        setTestResults([`Error: ${result.error}`]);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setTestResults([`Error: ${errorMessage}`]);
    } finally {
      setIsLoading(false);
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
                nodeData.url &&
                  nodeData.selectors?.length > 0 &&
                  "ring-2 ring-blue-500/50"
              )}
            >
              <WebScrapingIcon />
              {nodeData.label && (
                <div className='absolute -bottom-6 text-xs text-gray-600 font-medium'>
                  {nodeData.label}
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
          <Card
            className={cn(
              "border-none shadow-none",
              selected && "border-blue-500"
            )}
          >
            <CardHeader className='flex flex-row items-center gap-2'>
              <WebScrapingIcon />
              <div>
                <CardTitle>Web Scraping</CardTitle>
                <CardDescription>
                  Extract data from a website using CSS or XPath selectors
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              <Tabs defaultValue='general'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='general'>General</TabsTrigger>
                  <TabsTrigger value='selectors'>Selectors</TabsTrigger>
                </TabsList>

                <TabsContent value='general'>
                  <div className='space-y-4'>
                    <div>
                      <Label>Node Label</Label>
                      <Input
                        value={nodeData.label || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleConfigChange("label", e.target.value)
                        }
                        placeholder='Node Label'
                      />
                    </div>

                    <div>
                      <Label>URL</Label>
                      <Input
                        value={nodeData.url || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleConfigChange("url", e.target.value)
                        }
                        placeholder='https://example.com'
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='selectors' className='space-y-4'>
                  <SelectorEditor
                    selectors={nodeData.selectors}
                    template={nodeData.template}
                    testResults={testResults}
                    isLoading={isLoading}
                    onUpdateSelectors={(selectors) =>
                      handleConfigChange("selectors", selectors)
                    }
                    onUpdateTemplate={(template) =>
                      handleConfigChange("template", template)
                    }
                    onTestSelector={handleSelectorTest}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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

export default memo(WebScrapingNode);
