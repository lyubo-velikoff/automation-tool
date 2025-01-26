"use client";

import { memo, useCallback, useState } from "react";
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
import { Button } from "@/components/ui/inputs/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { NodeData as GlobalNodeData } from "@/components/workflow/config/nodeTypes";

interface SelectorConfig {
  selector: string;
  selectorType: "css" | "xpath";
  attributes: string[];
  name?: string;
  description?: string;
}

interface PaginationConfig {
  selector?: string;
  maxPages?: number;
}

interface NodeData extends GlobalNodeData {
  selectors: SelectorConfig[];
  pagination?: PaginationConfig;
  template?: string;
  [key: string]: unknown;
}

interface GraphQLNodeData {
  url?: string;
  selector?: string;
  selectorType?: "css" | "xpath";
  attributes?: string[];
  template?: string;
  label?: string;
  [key: string]: unknown;
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
    width='32'
    height='32'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='text-blue-500'
  >
    <path d='M14 7h6.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 1 23 9.828V19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 1 12 5v2h2z' />
    <path d='M3 15h18' />
  </svg>
));
WebScrapingIcon.displayName = "WebScrapingIcon";

// Convert incoming GraphQL data to our UI format
function convertIncomingData(data: GraphQLNodeData): NodeData {
  // Extract only the fields we need for NodeData
  const { url, selector, selectorType, attributes, template, label, ...rest } =
    data;

  // Create the node data with all fields
  const nodeData: NodeData = {
    url,
    label,
    template, // Don't apply default value
    ...rest,
    selectors: [
      {
        selector: selector || "",
        selectorType: selectorType || "css",
        attributes: attributes || ["text", "href"],
        name: "Main Content"
      }
    ]
  };

  return nodeData;
}

function WebScrapingNode({
  id,
  data,
  selected,
  type,
  isConnectable
}: WebScrapingNodeProps) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert incoming data to our format
  const nodeData = convertIncomingData(data);

  const handleConfigChange = useCallback(
    (key: keyof NodeData, value: unknown) => {
      const { onConfigChange } = data;
      if (!onConfigChange) return;

      // Create new data preserving existing fields
      const newData = {
        ...data,
        [key]: value
      };

      // For selectors, we need to flatten the structure back for GraphQL
      if (key === "selectors") {
        const firstSelector = (Array.isArray(value) && value[0]) || {};
        const graphqlData = newData as GraphQLNodeData;
        graphqlData.selector = firstSelector.selector || "";
        graphqlData.selectorType = firstSelector.selectorType || "css";
        graphqlData.attributes = firstSelector.attributes || ["text"];
      }

      onConfigChange(id || "", newData);
    },
    [data, id]
  );

  const handleSelectorTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/test-selector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: nodeData.url,
          selector: nodeData.selectors[0]?.selector,
          selectorType: nodeData.selectors[0]?.selectorType,
          attributes: nodeData.selectors[0]?.attributes
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
                data.url &&
                  data.selectors?.length > 0 &&
                  "ring-2 ring-blue-500/50"
              )}
            >
              <WebScrapingIcon />
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
              <WebScrapingIcon />
              Web Scraping
            </CardTitle>
            <CardDescription>
              Extract data from websites using CSS or XPath selectors
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
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

            <div>
              <Label>CSS Selector</Label>
              <div className='flex gap-2'>
                <Input
                  value={nodeData.selectors?.[0]?.selector ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleConfigChange("selectors", [
                      {
                        ...(nodeData.selectors?.[0] ?? {}),
                        selector: e.target.value,
                        selectorType: "css",
                        attributes: ["text", "href"]
                      }
                    ])
                  }
                  placeholder='h1, .post-title, etc'
                />
                <Button
                  variant='outline'
                  onClick={handleSelectorTest}
                  disabled={
                    isLoading ||
                    !nodeData.url ||
                    !nodeData.selectors?.[0]?.selector
                  }
                >
                  {isLoading ? "Testing..." : "Test"}
                </Button>
              </div>
            </div>

            <div>
              <Label>Output Template</Label>
              <Textarea
                value={nodeData.template ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleConfigChange("template", e.target.value || undefined)
                }
                placeholder='{{text}}\nURL: {{href}}'
                rows={3}
              />
            </div>

            {testResults.length > 0 && (
              <div>
                <Label>Test Results</Label>
                <div className='mt-2 p-2 bg-muted rounded-md'>
                  <pre className='whitespace-pre-wrap text-sm'>
                    {testResults.slice(0, 5).join("\n\n")}
                    {testResults.length > 5 &&
                      "\n\n...and " +
                        (testResults.length - 5) +
                        " more results"}
                  </pre>
                </div>
              </div>
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

export default memo(WebScrapingNode);
