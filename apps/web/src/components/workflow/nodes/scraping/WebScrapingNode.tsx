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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";

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

interface NodeData {
  label?: string;
  url?: string;
  selectors: SelectorConfig[];
  pagination?: PaginationConfig;
  outputTemplate?: string;
  onConfigChange?: (id: string, data: GraphQLNodeData) => void;
}

interface GraphQLNodeData {
  label?: string;
  url?: string;
  selector: string;
  selectorType: "css" | "xpath";
  attributes: string[];
  template?: string;
  pollingInterval?: number | null;
  fromFilter?: string | null;
  subjectFilter?: string | null;
  to?: string | null;
  subject?: string | null;
  body?: string | null;
  prompt?: string | null;
  model?: string | null;
  maxTokens?: number | null;
}

interface WebScrapingNodeProps {
  id?: string;
  data: NodeData;
  selected?: boolean;
  type?: string;
  isConnectable: boolean;
}

const presets = {
  cursorForum: {
    name: 'Cursor Forum Posts',
    url: 'https://forum.cursor.com',
    selectors: [{
      selector: 'tr.topic-list-item a[href*="/t/"]',
      selectorType: 'css' as const,
      attributes: ['text', 'href']
    }],
    template: '{{text}}\nURL: {{href}}'
  }
};

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

function SelectorInput({
  selector,
  onChange,
  onTest,
  onRemove,
  isOnly,
  isLoading
}: {
  selector: SelectorConfig;
  onChange: (updates: Partial<SelectorConfig>) => void;
  onTest: () => void;
  onRemove: () => void;
  isOnly: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          value={selector.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Selector name (optional)"
          className="w-2/3"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={isLoading}
          >
            {isLoading ? "Testing..." : "Test"}
          </Button>
          {!isOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-500"
              disabled={isLoading}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label>Selector</Label>
          <div className="flex gap-2">
            <Input
              value={selector.selector}
              onChange={(e) => onChange({ selector: e.target.value })}
              placeholder="Enter CSS or XPath selector"
              className="flex-1"
            />
            <Select
              value={selector.selectorType}
              onValueChange={(value: "css" | "xpath") => 
                onChange({ selectorType: value })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="xpath">XPath</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Attributes to Extract</Label>
          <Select
            value={selector.attributes.join(",")}
            onValueChange={(value: string) =>
              onChange({ attributes: value.split(",") })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Content</SelectItem>
              <SelectItem value="href">Link URL (href)</SelectItem>
              <SelectItem value="text,href">Text + URL</SelectItem>
              <SelectItem value="text,href,title">Text + URL + Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function PresetButton({ 
  preset: [key, preset], 
  onClick 
}: { 
  preset: [string, { 
    name: string; 
    url?: string;
    selectors: SelectorConfig[]; 
    template: string 
  }];
  onClick: () => void;
}) {
  return (
    <Button
      key={key}
      variant="outline"
      size="sm"
      onClick={onClick}
      title={`Use preset configuration for ${preset.name}`}
    >
      {preset.name}
    </Button>
  );
}

function NodeContent({
  data,
  handleConfigChange
}: {
  data: NodeData;
  handleConfigChange: (
    key: keyof NodeData,
    value: unknown
  ) => void;
}) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectorTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/test-selector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: data.url,
          selector: data.selectors[0].selector,
          selectorType: data.selectors[0].selectorType,
          attributes: data.selectors[0].attributes
        })
      });
      
      const result = await response.json() as { success: boolean; results: Array<{ text?: string; href?: string }>; error?: string };
      if (result.success) {
        setTestResults(result.results.map(r => 
          data.outputTemplate
            ? data.outputTemplate
                .replace(/{{text}}/g, r.text || '')
                .replace(/{{href}}/g, r.href || '')
            : JSON.stringify(r)
        ));
      } else {
        setTestResults([`Error: ${result.error}`]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResults([`Error: ${errorMessage}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (preset: typeof presets.cursorForum) => {
    handleConfigChange('url', preset.url);
    handleConfigChange('selectors', preset.selectors);
    handleConfigChange('outputTemplate', preset.template);
    handleConfigChange('label', preset.name);
  };

  const addSelector = () => {
    const newSelectors = [...data.selectors, {
      selector: "",
      selectorType: "css",
      attributes: ["text"],
      name: `Selector ${data.selectors.length + 1}`
    }];
    handleConfigChange("selectors", newSelectors);
  };

  const removeSelector = (index: number) => {
    const newSelectors = data.selectors.filter((_, i) => i !== index);
    handleConfigChange("selectors", newSelectors);
  };

  const updateSelector = (index: number, updates: Partial<SelectorConfig>) => {
    const newSelectors = [...data.selectors];
    newSelectors[index] = { ...newSelectors[index], ...updates };
    handleConfigChange("selectors", newSelectors);
  };

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex flex-col gap-2'>
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleConfigChange("label", e.target.value)}
          placeholder='Enter a label for this node'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label>URL</Label>
        <Input
          value={data.url || ""}
          onChange={(e) => handleConfigChange("url", e.target.value)}
          placeholder='Enter URL to scrape'
        />
        <div className="flex gap-2 mt-1">
          <PresetButton
            preset={["cursorForum", presets.cursorForum]}
            onClick={() => applyPreset(presets.cursorForum)}
          />
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <div className="flex justify-between items-center">
          <Label>Selectors</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addSelector}
          >
            Add Selector
          </Button>
        </div>
        
        {data.selectors.map((selector, index) => (
          <SelectorInput
            key={index}
            selector={selector}
            onChange={(updates) => updateSelector(index, updates)}
            onTest={() => handleSelectorTest()}
            onRemove={() => removeSelector(index)}
            isOnly={data.selectors.length === 1}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className='flex flex-col gap-2'>
        <Label>Output Template</Label>
        <Textarea
          value={data.outputTemplate || ""}
          onChange={(e) => handleConfigChange("outputTemplate", e.target.value)}
          placeholder='Enter template for results'
          rows={3}
        />
        <p className='text-xs text-muted-foreground'>
          Available variables: {"{text}"}, {"{href}"}, {"{title}"}
        </p>
      </div>

      {testResults.length > 0 && (
        <div className='mt-4'>
          <Label>Test Results</Label>
          <div className='bg-muted p-2 rounded-md mt-1'>
            <pre className='whitespace-pre-wrap text-sm'>
              {testResults.slice(0, 5).join('\n\n')}
              {testResults.length > 5 && '\n\n...and ' + (testResults.length - 5) + ' more results'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

const defaultData: NodeData = {
  selectors: [{
    selector: "td.topic-list-item a.title",
    selectorType: "css",
    attributes: ["text", "href"],
    name: "Main Content"
  }],
  outputTemplate: "[{text}]({href})"
};

// Add a type guard to ensure we only send GraphQL-compatible data
function createGraphQLNodeData(data: NodeData): GraphQLNodeData {
  return {
    label: data.label,
    url: data.url,
    selector: data.selectors[0]?.selector || "",
    selectorType: data.selectors[0]?.selectorType || "css",
    attributes: data.selectors[0]?.attributes || [],
    template: data.outputTemplate,
    pollingInterval: null,
    fromFilter: null,
    subjectFilter: null,
    to: null,
    subject: null,
    body: null,
    prompt: null,
    model: null,
    maxTokens: null
  };
}

function WebScrapingNode({ id, data, selected, type, isConnectable }: WebScrapingNodeProps) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigChange = useCallback(
    (key: keyof NodeData, value: unknown) => {
      const { onConfigChange } = data;
      if (!onConfigChange) return;

      // Update internal state first
      const newInternalData: NodeData = {
        ...defaultData,
        ...data,
        [key]: value
      };

      // Transform to GraphQL format using the type guard
      const graphqlData = createGraphQLNodeData(newInternalData);

      // Send only the GraphQL-compatible data
      onConfigChange(id || "", graphqlData);
    },
    [data, id]
  );

  const handleSelectorTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/test-selector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: data.url,
          selector: data.selectors[0].selector,
          selectorType: data.selectors[0].selectorType,
          attributes: data.selectors[0].attributes
        })
      });
      
      const result = await response.json() as { success: boolean; results: Array<{ text?: string; href?: string }>; error?: string };
      if (result.success) {
        setTestResults(result.results.map(r => 
          data.outputTemplate
            ? data.outputTemplate
                .replace(/{{text}}/g, r.text || '')
                .replace(/{{href}}/g, r.href || '')
            : JSON.stringify(r)
        ));
      } else {
        setTestResults([`Error: ${result.error}`]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResults([`Error: ${errorMessage}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (preset: typeof presets.cursorForum) => {
    handleConfigChange('url', preset.url);
    handleConfigChange('selectors', preset.selectors);
    handleConfigChange('outputTemplate', preset.template);
    handleConfigChange('label', preset.name);
  };

  // Ensure data has default values
  const nodeData: NodeData = {
    ...defaultData,
    ...data
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
                nodeData.url && nodeData.selectors.length > 0 && "ring-2 ring-blue-500/50"
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
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Presets</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  onClick={() => applyPreset(presets.cursorForum)}
                >
                  Cursor Forum Posts
                </Button>
              </div>
            </div>

            <div>
              <Label>URL</Label>
              <Input
                value={nodeData.url || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange("url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label>CSS Selector</Label>
              <div className="flex gap-2">
                <Input
                  value={nodeData.selectors[0]?.selector}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange("selectors", [{
                    ...nodeData.selectors[0],
                    selector: e.target.value
                  }])}
                  placeholder="h1, .post-title, etc"
                />
                <Button 
                  variant="outline"
                  onClick={handleSelectorTest}
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </div>

            <div>
              <Label>Output Template</Label>
              <Textarea
                value={nodeData.outputTemplate || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleConfigChange("outputTemplate", e.target.value)}
                placeholder="{{text}}\nURL: {{href}}"
                rows={3}
              />
            </div>

            {testResults.length > 0 && (
              <div>
                <Label>Test Results</Label>
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {testResults.slice(0, 5).join('\n\n')}
                    {testResults.length > 5 && '\n\n...and ' + (testResults.length - 5) + ' more results'}
                  </pre>
                </div>
              </div>
            )}

            <Handle
              type="source"
              position={Position.Bottom}
              isConnectable={isConnectable}
            />
          </CardContent>
        </PopoverContent>
      </Popover>
      <Handle type='target' position={Position.Left} />
    </div>
  );
}

export default memo(WebScrapingNode);
