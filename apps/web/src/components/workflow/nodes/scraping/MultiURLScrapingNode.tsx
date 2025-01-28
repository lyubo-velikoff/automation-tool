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
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/data-display/accordion";
import { SelectorConfig, BatchConfig } from "@automation-tool/shared-types";

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

const MultiURLScrapingIcon = memo(() => (
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
    <path d='M3 7V5c0-1.1.9-2 2-2h2' />
    <path d='M17 3h2c1.1 0 2 .9 2 2v2' />
    <path d='M21 17v2c0 1.1-.9 2-2 2h-2' />
    <path d='M7 21H5c-1.1 0-2-.9-2-2v-2' />
    <rect x='7' y='7' width='10' height='10' rx='1' />
  </svg>
));
MultiURLScrapingIcon.displayName = "MultiURLScrapingIcon";

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
  const [newUrl, setNewUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

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
      .filter((url) => url && validateURL(url));

    if (urlList.length === 0) {
      setUrlError("No valid URLs found");
      return;
    }

    const currentUrls = new Set(data.urls || []);
    urlList.forEach((url) => currentUrls.add(url));

    handleConfigChange("urls", Array.from(currentUrls));
    setBulkUrls("");
    setUrlError(null);
  }, [bulkUrls, data.urls, handleConfigChange]);

  return (
    <div
      className={cn(
        "bg-background text-foreground relative",
        selected && "ring-2 ring-primary"
      )}
      data-testid={`node-${type?.toLowerCase()}`}
    >
      <Handle
        type='target'
        position={Position.Left}
        isConnectable={isConnectable}
      />

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
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MultiURLScrapingIcon />
              Multi-URL Scraping
            </CardTitle>
            <CardDescription>
              Extract data from multiple websites using CSS or XPath selectors
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='general'>
                <AccordionTrigger>General Settings</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
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
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='urls'>
                <AccordionTrigger>URL Management</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
                    <div>
                      <Label>Add URL</Label>
                      <div className='flex gap-2'>
                        <Input
                          value={newUrl}
                          onChange={(e) => {
                            setNewUrl(e.target.value);
                            setUrlError(null);
                          }}
                          placeholder='https://example.com'
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddUrl();
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddUrl}
                          className='whitespace-nowrap'
                          variant='secondary'
                        >
                          Add URL
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Bulk Add URLs</Label>
                      <Textarea
                        value={bulkUrls}
                        onChange={(e) => {
                          setBulkUrls(e.target.value);
                          setUrlError(null);
                        }}
                        placeholder='Enter multiple URLs (one per line)'
                        className='min-h-[100px]'
                      />
                      <Button
                        onClick={handleBulkAdd}
                        variant='secondary'
                        className='mt-2'
                      >
                        Add URLs
                      </Button>
                    </div>

                    {urlError && (
                      <div className='text-sm text-red-500 mt-1'>
                        {urlError}
                      </div>
                    )}

                    <div>
                      <Label>URL List ({data.urls?.length || 0})</Label>
                      <ScrollArea className='h-[200px] w-full border rounded-md'>
                        <div className='p-4 space-y-2'>
                          {data.urls?.map((url, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between gap-2 p-2 bg-muted rounded-md'
                            >
                              <span className='text-sm truncate flex-1'>
                                {url}
                              </span>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRemoveUrl(url)}
                                className='h-6 w-6 p-0'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                          {(!data.urls || data.urls.length === 0) && (
                            <div className='text-sm text-muted-foreground'>
                              No URLs added yet
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='selectors'>
                <AccordionTrigger>Selector Configuration</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
                    {(data.selectors || []).map((selector, index) => (
                      <div
                        key={index}
                        className='p-4 border rounded-md space-y-3 relative'
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveSelector(index)}
                          className='absolute right-2 top-2 h-6 w-6 p-0'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                        <div>
                          <Label>Selector Name</Label>
                          <Input
                            value={selector.name || ""}
                            onChange={(e) =>
                              handleSelectorChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder='e.g., Title, Content, Link'
                          />
                        </div>
                        <div>
                          <Label>Selector Type</Label>
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
                              <SelectItem value='css'>CSS Selector</SelectItem>
                              <SelectItem value='xpath'>XPath</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Selector</Label>
                          <Input
                            value={selector.selector}
                            onChange={(e) =>
                              handleSelectorChange(
                                index,
                                "selector",
                                e.target.value
                              )
                            }
                            placeholder={
                              selector.selectorType === "css"
                                ? ".article h1"
                                : "//h1"
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
                      </div>
                    ))}
                    <Button
                      onClick={handleAddSelector}
                      variant='outline'
                      className='w-full'
                    >
                      Add Selector
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='batch'>
                <AccordionTrigger>Batch Settings</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </PopoverContent>
      </Popover>

      <Handle
        type='source'
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(MultiURLScrapingNode);
