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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { cn } from "@/lib/utils";
import { NodeData as GlobalNodeData } from "@/components/workflow/config/nodeTypes";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { X, Globe2 } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/data-display/tabs";
import { SelectorConfig, BatchConfig } from "@automation-tool/shared-types";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/data-display/table";
import { Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/data-display/separator";
import { Badge } from "@/components/ui/data-display/badge";
import { Card as SelectorCard } from "@/components/ui/layout/card";
import { VariablePicker } from "@/components/workflow/shared/VariablePicker";

// Extended node data for multi-URL scraping
interface MultiURLNodeData extends GlobalNodeData {
  urls: string[];
  selectors: SelectorConfig[];
  batchConfig: BatchConfig;
  template?: string;
  [key: string]: unknown;
}

interface MultiURLScrapingNodeProps {
  id?: string;
  data: MultiURLNodeData;
  selected?: boolean;
  type?: string;
  isConnectable: boolean;
}

const MultiURLScrapingIcon = () => {
  return <Globe2 className='h-8 w-8 text-muted-foreground' />;
};

const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

function MultiURLScrapingNode({
  id,
  data,
  selected,
  type,
  isConnectable
}: MultiURLScrapingNodeProps) {
  const { toast } = useToast();
  const [newUrl, setNewUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [editingSelector, setEditingSelector] = useState<number | null>(null);
  const [testingSelector, setTestingSelector] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, any>>({});

  const handleConfigChange = useCallback(
    (key: keyof MultiURLNodeData, value: unknown) => {
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

  const handleSelectorChange = useCallback(
    (index: number, field: keyof SelectorConfig, value: unknown) => {
      const selectors = [...(data.selectors || [])];
      if (!selectors[index]) {
        selectors[index] = {
          selector: "",
          selectorType: "css",
          attributes: ["text"],
          name: `Selector ${index + 1}`
        };
      }
      selectors[index] = {
        ...selectors[index],
        [field]: value
      };
      handleConfigChange("selectors", selectors);
    },
    [data.selectors, handleConfigChange]
  );

  const handleBatchConfigChange = useCallback(
    (field: keyof BatchConfig, value: number) => {
      const batchConfig = {
        ...(data.batchConfig || { batchSize: 5, rateLimit: 10 }),
        [field]: value
      };
      handleConfigChange("batchConfig", batchConfig);
    },
    [data.batchConfig, handleConfigChange]
  );

  const handleAddSelector = useCallback(() => {
    const selectors = [...(data.selectors || [])];
    selectors.push({
      selector: "",
      selectorType: "css",
      attributes: ["text"],
      name: `Selector ${selectors.length + 1}`
    });
    handleConfigChange("selectors", selectors);
  }, [data.selectors, handleConfigChange]);

  const handleRemoveSelector = useCallback(
    (index: number) => {
      const selectors = [...(data.selectors || [])];
      selectors.splice(index, 1);
      handleConfigChange("selectors", selectors);
    },
    [data.selectors, handleConfigChange]
  );

  const handleAddUrl = useCallback(() => {
    if (!newUrl) {
      setUrlError("URL cannot be empty");
      return;
    }

    if (!validateURL(newUrl)) {
      setUrlError("Invalid URL format");
      return;
    }

    const currentUrls = data.urls || [];
    if (currentUrls.includes(newUrl)) {
      setUrlError("URL already exists in the list");
      return;
    }

    handleConfigChange("urls", [...currentUrls, newUrl]);
    setNewUrl("");
    setUrlError(null);
  }, [newUrl, data.urls, handleConfigChange]);

  const handleRemoveUrl = useCallback(
    (urlToRemove: string) => {
      const currentUrls = data.urls || [];
      handleConfigChange(
        "urls",
        currentUrls.filter((url) => url !== urlToRemove)
      );
    },
    [data.urls, handleConfigChange]
  );

  const handleBulkAdd = useCallback(() => {
    if (!bulkUrls.trim()) {
      setUrlError("Please enter URLs");
      return;
    }

    const urlList = bulkUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => {
        // Handle variable format {{NodeName.results}}
        if (url.match(/{{.*?}}/)) {
          // For now, accept variables as valid entries
          return true;
        }
        // Otherwise validate as URL
        return url && validateURL(url);
      });

    if (urlList.length === 0) {
      setUrlError("No valid URLs or variables found");
      return;
    }

    const currentUrls = new Set(data.urls || []);
    urlList.forEach((url) => currentUrls.add(url));

    handleConfigChange("urls", Array.from(currentUrls));
    setBulkUrls("");
    setUrlError(null);
  }, [bulkUrls, data.urls, handleConfigChange]);

  const handleEditSelector = (index: number) => {
    setEditingSelector(index);
  };

  const handleSaveSelector = () => {
    setEditingSelector(null);
  };

  const handleTestSelector = async (index: number) => {
    const selector = data.selectors[index];
    const testUrl = data.urls?.[0];

    if (!testUrl) {
      toast({
        title: "Test Failed",
        description: "Please add at least one URL to test the selector",
        variant: "destructive"
      });
      return;
    }

    if (!selector.selector) {
      toast({
        title: "Test Failed",
        description: "Please enter a selector to test",
        variant: "destructive"
      });
      return;
    }

    setTestingSelector(index);

    try {
      const response = await fetch("http://localhost:4000/api/test-selector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: testUrl,
          selector: selector.selector,
          selectorType: selector.selectorType,
          attributes: selector.attributes
        })
      });

      const result = await response.json();

      if (result.success) {
        setTestResults((prev) => ({
          ...prev,
          [index]: result.results[0]
        }));
        toast({
          title: "Test Successful",
          description: `Found ${result.count} matches`
        });
      } else {
        setTestResults((prev) => ({
          ...prev,
          [index]: null
        }));
        toast({
          title: "Test Failed",
          description: result.error || "Failed to test selector",
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [index]: null
      }));
      toast({
        title: "Test Failed",
        description:
          "Failed to test selector. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setTestingSelector(null);
    }
  };

  const renderSelector = (selector: SelectorConfig, index: number) => {
    if (editingSelector === index) {
      return (
        <SelectorCard key={index} className='p-4 space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Name</Label>
              <Input
                value={selector.name || ""}
                onChange={(e) =>
                  handleSelectorChange(index, "name", e.target.value)
                }
                placeholder='e.g., Title, Content, Link'
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={selector.selectorType}
                onValueChange={(value) =>
                  handleSelectorChange(index, "selectorType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='css'>CSS</SelectItem>
                  <SelectItem value='xpath'>XPath</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Selector</Label>
            <Input
              value={selector.selector}
              onChange={(e) =>
                handleSelectorChange(index, "selector", e.target.value)
              }
              placeholder={
                selector.selectorType === "css"
                  ? "#topic-title h1 a"
                  : "//div[@id='topic-title']//h1/a"
              }
            />
          </div>
          <div>
            <Label>Attributes</Label>
            <Select
              value={selector.attributes[0]}
              onValueChange={(value) =>
                handleSelectorChange(index, "attributes", [value])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='text'>Text Content</SelectItem>
                <SelectItem value='href'>Link URL</SelectItem>
                <SelectItem value='src'>Image Source</SelectItem>
                <SelectItem value='html'>HTML Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex justify-end'>
            <Button variant='ghost' size='sm' onClick={handleSaveSelector}>
              Save
            </Button>
          </div>
        </SelectorCard>
      );
    }

    return (
      <SelectorCard key={index} className='relative'>
        <div className='p-4 space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='font-medium'>
                {selector.name || `Selector ${index + 1}`}
              </div>
              <Badge
                variant={
                  selector.selectorType === "css" ? "default" : "secondary"
                }
              >
                {selector.selectorType}
              </Badge>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleTestSelector(index)}
                disabled={testingSelector === index}
              >
                {testingSelector === index ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  "Test"
                )}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleEditSelector(index)}
              >
                <Edit2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleRemoveSelector(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <code className='block px-2 py-1 bg-muted rounded text-xs overflow-x-auto'>
            {selector.selector}
          </code>
          <div className='flex items-center gap-2'>
            {selector.attributes.map((attr) => (
              <Badge key={attr} variant='outline'>
                {attr}
              </Badge>
            ))}
          </div>
        </div>
        {testResults[index] && (
          <div className='border-t bg-muted/50 p-2 text-xs'>
            <div className='font-medium mb-1'>Test Result:</div>
            <code className='block'>
              {JSON.stringify(testResults[index], null, 2)}
            </code>
          </div>
        )}
      </SelectorCard>
    );
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
                data.urls?.length > 0 &&
                  data.selectors?.length > 0 &&
                  "ring-2 ring-blue-500/50"
              )}
            >
              <MultiURLScrapingIcon />
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
          <Card
            className={cn(
              "border-none shadow-none",
              selected && "border-blue-500"
            )}
          >
            <CardHeader className='flex flex-row items-center gap-2'>
              <MultiURLScrapingIcon />
              <div>
                <CardTitle>Multi-URL Scraping</CardTitle>
                <CardDescription>
                  Extract data from multiple websites using CSS or XPath
                  selectors
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              <Tabs defaultValue='general'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='general'>General</TabsTrigger>
                  <TabsTrigger value='urls'>URLs</TabsTrigger>
                  <TabsTrigger value='selectors'>Selectors</TabsTrigger>
                  <TabsTrigger value='settings'>Settings</TabsTrigger>
                </TabsList>

                <TabsContent value='general'>
                  <div>
                    <Label>Node Label</Label>
                    <Input
                      value={data.label || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleConfigChange("label", e.target.value)
                      }
                      placeholder='Node Label'
                    />
                  </div>
                </TabsContent>

                <TabsContent value='urls' className='space-y-4'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label>Add URL</Label>
                      <div className='flex gap-2'>
                        <Input
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder='https://example.com'
                          className='flex-grow'
                        />
                        <Button onClick={handleAddUrl}>Add URL</Button>
                      </div>
                      {urlError && (
                        <p className='text-sm text-red-500'>{urlError}</p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label>Bulk Add URLs</Label>
                      <div className='flex flex-col gap-2'>
                        <Textarea
                          value={bulkUrls}
                          onChange={(e) => setBulkUrls(e.target.value)}
                          placeholder='Enter multiple URLs (one per line) or use variables from other nodes (e.g. {{Node Name.results}})'
                          className='min-h-[100px]'
                        />
                        <div className='flex justify-between items-center'>
                          <Button onClick={handleBulkAdd}>Add URLs</Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant='outline' size='sm'>
                                Insert Variable
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-64' align='end'>
                              <VariablePicker
                                nodeId={id || ""}
                                onInsertVariable={(variable: string) => {
                                  const currentText = bulkUrls;
                                  setBulkUrls(
                                    currentText +
                                      (currentText ? "\n" : "") +
                                      variable
                                  );
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>URL List ({data.urls?.length || 0})</Label>
                      <ScrollArea className='h-[200px] w-full rounded-md border'>
                        {data.urls?.length ? (
                          <div className='p-4 space-y-2'>
                            {data.urls.map((url, index) => (
                              <div
                                key={index}
                                className='flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50'
                              >
                                <span className='text-sm truncate flex-grow'>
                                  {url}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => {
                                    const newUrls = [...(data.urls || [])];
                                    newUrls.splice(index, 1);
                                    handleConfigChange("urls", newUrls);
                                  }}
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='p-4 text-sm text-muted-foreground text-center'>
                            No URLs added yet
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='selectors' className='space-y-4'>
                  <div className='space-y-2'>
                    {(data.selectors || []).map((selector, index) =>
                      renderSelector(selector, index)
                    )}
                    {(!data.selectors || data.selectors.length === 0) && (
                      <div className='text-center text-muted-foreground py-8 border rounded-md'>
                        No selectors configured
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleAddSelector}
                    variant='outline'
                    className='w-full'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Selector
                  </Button>

                  <Separator className='my-4' />

                  <div className='space-y-4'>
                    <div>
                      <Label>Output Template</Label>
                      <Textarea
                        value={data.template || ""}
                        onChange={(e) =>
                          handleConfigChange("template", e.target.value)
                        }
                        placeholder='Example:
Title: {{Title}}
URL: {{url}}
Content: {{Content}}'
                        rows={4}
                        className='font-mono text-sm'
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        Use double curly braces and exact selector name (e.g.,{" "}
                        {"{{Content}}"}) to reference selector outputs.
                        Available variables: {"{{url}}"}, {"{{index}}"}, and
                        your selector names (case-sensitive).
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='settings' className='space-y-4'>
                  <div>
                    <Label>Batch Size</Label>
                    <Input
                      type='number'
                      min={1}
                      max={50}
                      value={data.batchConfig?.batchSize || 5}
                      onChange={(e) =>
                        handleBatchConfigChange(
                          "batchSize",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder='Number of URLs to process at once'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Process 1-50 URLs simultaneously
                    </p>
                  </div>
                  <div>
                    <Label>Rate Limit (requests per minute)</Label>
                    <Input
                      type='number'
                      min={1}
                      max={60}
                      value={data.batchConfig?.rateLimit || 10}
                      onChange={(e) =>
                        handleBatchConfigChange(
                          "rateLimit",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder='Maximum requests per minute'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Limit requests to avoid overloading servers
                    </p>
                  </div>
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

export function MultiURLScrapingDisplay() {
  return (
    <div className='flex items-center justify-center w-[100px] h-[60px] rounded-lg bg-background border shadow-sm'>
      <Globe2 className='h-6 w-6 text-muted-foreground' />
    </div>
  );
}

export default memo(MultiURLScrapingNode);
