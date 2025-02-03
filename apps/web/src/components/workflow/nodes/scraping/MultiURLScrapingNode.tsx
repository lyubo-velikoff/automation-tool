"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position, useEdges, useNodes } from "reactflow";
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
import { SelectorEditor } from "./components/SelectorEditor";
import { VariableSelector } from "../components/VariableSelector";
import { SelectorConfig, BatchConfig } from "@/types/scraping";
import { gql, useMutation } from "@apollo/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

const TEST_SCRAPING = gql`
  mutation TestScraping($url: String!, $selectors: [SelectorConfigInput!]!) {
    testScraping(url: $url, selectors: $selectors) {
      success
      error
      results
    }
  }
`;

// Extended node data for multi-URL scraping
interface MultiURLNodeData extends GlobalNodeData {
  urls: string[];
  selectors: SelectorConfig[];
  batchConfig: BatchConfig;
  template?: string;
  sourceNode?: {
    id: string;
    name: string;
    results: string;
  };
  onConfigChange?: (nodeId: string, data: MultiURLNodeData) => void;
  urlTemplate?: string;
  testResults?: Record<number, string[]>;
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
  const [lastTestedSelector, setLastTestedSelector] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, any>>({});
  const edges = useEdges();
  const nodes = useNodes();
  const [testScraping] = useMutation(TEST_SCRAPING);

  // Convert test results from record to array for the selector editor
  const currentTestResults =
    lastTestedSelector !== null && testResults[lastTestedSelector]
      ? testResults[lastTestedSelector].map((result: any) => 
          // If result is an array, use it directly, otherwise wrap it in an array
          Array.isArray(result) ? result : [result]
        )
      : [];

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

  const resolveVariableUrl = useCallback((url: string) => {
    // If it's not a variable reference, return as is
    if (!url.match(/^\{\{.*\}\}$/)) return url;

    // Extract the variable path (e.g., "Cursor forum.Content[0]")
    const variablePath = url.replace(/^\{\{|\}\}$/g, '').split('.');
    const nodeName = variablePath[0];
    const selectorName = variablePath[1];
    const index = variablePath[2]?.match(/\[(\d+)\]/)?.[1];

    // Find the source node
    const sourceNode = nodes.find(n => n.data.label === nodeName);
    if (!sourceNode?.data?.results) return url;

    try {
      // Parse the results
      const results = JSON.parse(sourceNode.data.results);
      if (!results.bySelector?.[selectorName]) return url;

      // Get the specific result
      const selectorResults = results.bySelector[selectorName];
      if (!Array.isArray(selectorResults)) return url;

      // Get the specific index if provided, otherwise first result
      const resultIndex = index ? parseInt(index) : 0;
      return selectorResults[resultIndex] || url;
    } catch {
      return url;
    }
  }, [nodes]);

  const processUrlTemplate = useCallback((template: string, url: string) => {
    if (!template || !template.trim()) return url;
    
    try {
      // First resolve any variables in the URL
      const resolvedUrl = resolveVariableUrl(url);
      
      // If the resolved URL is still a variable reference, return it
      if (resolvedUrl.match(/^\{\{.*\}\}$/)) return resolvedUrl;

      // If the URL is already absolute, don't apply the template
      if (resolvedUrl.match(/^https?:\/\//)) return resolvedUrl;

      // Replace the variable placeholder with the URL
      const processed = template.replace(/\{\{.*?\}\}/, (match) => {
        // If the URL starts with a slash, remove it to avoid double slashes
        return resolvedUrl.startsWith('/') ? resolvedUrl.slice(1) : resolvedUrl;
      });

      // Validate the resulting URL
      if (validateURL(processed)) {
        return processed;
      }

      // If validation fails, try prepending https:// if there's no protocol
      if (!processed.match(/^https?:\/\//)) {
        const withProtocol = `https://${processed}`;
        return validateURL(withProtocol) ? withProtocol : url;
      }

      return url;
    } catch {
      return url;
    }
  }, [resolveVariableUrl]);

  const handleTestSelector = async (index: number) => {
    try {
      setTestingSelector(index);
      setLastTestedSelector(index);

      if (!data.urls || data.urls.length === 0) {
        toast({
          title: "Test Failed",
          description: "Please add at least one URL in the URLs tab before testing",
          variant: "destructive"
        });
        return null;
      }

      // Get the first URL and resolve any variables
      const firstUrl = data.urls[0];
      const resolvedUrl = resolveVariableUrl(firstUrl);
      
      // Process URL with template
      const testUrl = processUrlTemplate(data.template || "", resolvedUrl);

      console.log("Testing URL:", {
        original: firstUrl,
        resolved: resolvedUrl,
        final: testUrl
      });

      if (!testUrl || !validateURL(testUrl)) {
        toast({
          title: "Test Failed",
          description: "Invalid URL after processing. Please check your URL and template",
          variant: "destructive"
        });
        return null;
      }

      // Get the selector at the specified index
      const selector = data.selectors?.[index];
      if (!selector) {
        toast({
          title: "Test Failed",
          description: "Selector not found",
          variant: "destructive"
        });
        return null;
      }

      // Ensure selector has all required fields with defaults
      const normalizedSelector = {
        selector: selector.selector || "",
        selectorType: selector.selectorType || "css",
        attributes: selector.attributes || ["text"],
        name: selector.name || "Test Selector",
        description: selector.description || ""
      };

      // Validate selector
      if (!normalizedSelector.selector) {
        toast({
          title: "Test Failed",
          description: "Please enter a selector value",
          variant: "destructive"
        });
        return null;
      }

      // Map UI attribute values to actual attributes
      const attributeMap: { [key: string]: string[] } = {
        "Text Content": ["text"],
        "Link URL": ["href"],
        "Source URL": ["src"],
        "HTML Content": ["html"],
        "Text + Link URL": ["text", "href"],
        "Text + Source URL": ["text", "src"],
        "Text + Link URL + Title": ["text", "href", "title"],
        "Text + HTML Content": ["text", "html"]
      };

      // Get the actual attributes array
      const mappedAttributes = normalizedSelector.attributes && normalizedSelector.attributes.length > 0
        ? attributeMap[normalizedSelector.attributes[0]] || ["text"]
        : ["text"];

      console.log("Testing selector with config:", {
        url: testUrl,
        selector: normalizedSelector.selector,
        selectorType: normalizedSelector.selectorType,
        attributes: mappedAttributes,
        name: normalizedSelector.name
      });

      const response = await testScraping({
        variables: {
          url: testUrl,
          selectors: [{
            selector: normalizedSelector.selector,
            selectorType: normalizedSelector.selectorType.toLowerCase() as "css" | "xpath",
            attributes: mappedAttributes,
            name: normalizedSelector.name,
            description: normalizedSelector.description
          }]
        }
      });

      if (response.data?.testScraping.success) {
        toast({
          title: "Test Successful",
          description: `Found ${response.data.testScraping.results.length} matches`
        });
        setTestResults(prev => ({
          ...prev,
          [index]: response.data.testScraping.results
        }));
        return response.data.testScraping.results;
      } else {
        toast({
          title: "Test Failed",
          description: response.data.testScraping.error || "Unknown error",
          variant: "destructive"
        });
        setLastTestedSelector(null);  // Clear last tested selector on failure
        return null;
      }
    } catch (error) {
      console.error("Error testing selector:", error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setLastTestedSelector(null);  // Clear last tested selector on error
      return null;
    } finally {
      setTestingSelector(null);
    }
  };

  const handleVariableSelect = useCallback(
    (reference: string) => {
      const currentUrls = data.urls || [];
      handleConfigChange("urls", [...currentUrls, reference]);
    },
    [data.urls, handleConfigChange]
  );

  // Update the useEffect for handling connections
  useEffect(() => {
    if (!id) return;

    // Find incoming edge to this node
    const incomingEdge = edges.find(
      (edge) => edge.target === id && edge.targetHandle === "source"
    );

    // If no incoming edge, clear source node if it exists
    if (!incomingEdge && data.sourceNode) {
      handleConfigChange("sourceNode", null);
      return;
    }

    // Skip if no incoming edge
    if (!incomingEdge) return;

    // Find source node
    const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
    if (!sourceNode?.data) return;

    // Only update if the source node has changed
    const currentSourceNode = data.sourceNode;
    const newSourceNode = {
      id: sourceNode.id,
      name: sourceNode.data.label || "Unnamed Node",
      results: sourceNode.data.results || ""
    };

    if (
      !currentSourceNode ||
      currentSourceNode.id !== newSourceNode.id ||
      currentSourceNode.name !== newSourceNode.name ||
      currentSourceNode.results !== newSourceNode.results
    ) {
      handleConfigChange("sourceNode", newSourceNode);
    }
  }, [
    edges,
    nodes,
    id,
    data.sourceNode?.id,
    data.sourceNode?.name,
    data.sourceNode?.results
  ]);

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
          <div className='border-t bg-muted/50 p-4'>
            <div className='font-medium text-sm mb-2'>Found {testResults[index].length} matches:</div>
            <ScrollArea className='h-[200px]'>
              <div className='space-y-2'>
                {testResults[index].slice(0, 10).map((result: any, idx: number) => (
                  <div key={idx} className='font-mono text-xs bg-background p-2 rounded'>
                    {JSON.stringify(result, null, 2)}
                  </div>
                ))}
                {testResults[index].length > 10 && (
                  <div className='text-xs text-muted-foreground text-center pt-2'>
                    + {testResults[index].length - 10} more results
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </SelectorCard>
    );
  };

  return (
    <>
      <Handle
        type='target'
        position={Position.Left}
        id='source'
        style={{ background: "#555" }}
        isConnectable={isConnectable}
      />
      <Handle
        type='source'
        position={Position.Right}
        id='output'
        style={{ background: "#555" }}
        isConnectable={isConnectable}
      />
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
            className='w-[400px] max-h-[80vh] overflow-y-auto'
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
                        {data.sourceNode && (
                          <div className='space-y-2'>
                            <Label>Add from Source Node</Label>
                            <VariableSelector
                              sourceNodeId={data.sourceNode.id}
                              sourceNodeName={data.sourceNode.name}
                              nodeResults={data.sourceNode.results}
                              onSelect={handleVariableSelect}
                              className='w-full'
                            />
                          </div>
                        )}
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
                                  className='flex items-center p-2 rounded-lg bg-muted/50'
                                >
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 w-8 p-0 shrink-0 mr-2'
                                    onClick={() => handleRemoveUrl(url)}
                                  >
                                    <X className='h-4 w-4' />
                                  </Button>
                                  <div className='flex-1 overflow-hidden'>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className='overflow-x-auto'>
                                            <span className='text-sm whitespace-nowrap inline-block'>
                                              {url}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className='max-w-[400px] break-all'>{url}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
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

                      <div className='space-y-2'>
                        <Label>URL Template (Optional)</Label>
                        <Input
                          placeholder='e.g., https://example.com{{Custom.urls}}'
                          value={data.template || ""}
                          onChange={(e) =>
                            handleConfigChange("template", e.target.value)
                          }
                        />
                        <p className='text-xs text-muted-foreground'>
                          Use {"{{"} variable {"}}"} syntax to insert variables.
                          Leave empty to use raw URLs.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='selectors' className='space-y-4'>
                    <SelectorEditor
                      selectors={data.selectors || []}
                      template={data.template}
                      testResults={currentTestResults}
                      isLoading={testingSelector !== null}
                      onUpdateSelectors={(selectors) =>
                        handleConfigChange("selectors", selectors)
                      }
                      onUpdateTemplate={(template) =>
                        handleConfigChange("template", template)
                      }
                      onTestSelector={handleTestSelector}
                    />

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
      </div>
    </>
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
