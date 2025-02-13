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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/overlays/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { X, Globe2 } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/data-display/tabs";
import { useToast } from "@/hooks/use-toast";
import { SelectorEditor } from "./components/SelectorEditor";
import { SelectorConfig, BatchConfig, ScrapingNodeData, SelectorType } from "@/types/scraping";
import { gql, useMutation } from "@apollo/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Maybe, NodeData, SelectorConfigType } from '@/gql/graphql';
import { Textarea } from "@/components/ui/inputs/textarea";

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
interface MultiURLNodeData extends Omit<ScrapingNodeData, 'selectors' | 'batchConfig'> {
  selectors?: Maybe<SelectorConfig[]>;
  batchConfig?: Maybe<BatchConfig>;
  template?: Maybe<string>;
  urls?: string[];
  sourceNode?: {
    id: string;
    name: string;
    results: string;
  };
  onConfigChange?: (nodeId: string, data: NodeData) => void;
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

interface NodeDataWithResults {
  label?: string;
  results?: string;
  type?: string;
  [key: string]: any;
}

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



  // Update the useEffect for handling connections to store results
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

    const sourceData = sourceNode.data as NodeDataWithResults;

    // Only update if the source node has changed
    const currentSourceNode = data.sourceNode;
    const newSourceNode = {
      id: sourceNode.id,
      name: sourceData.label || "Unnamed Node",
      results: sourceData.results || ""
    };

    if (
      !currentSourceNode ||
      currentSourceNode.id !== newSourceNode.id ||
      currentSourceNode.name !== newSourceNode.name ||
      currentSourceNode.results !== newSourceNode.results
    ) {
      handleConfigChange("sourceNode", newSourceNode);
    }
  }, [edges, nodes, id, data.sourceNode?.id, data.sourceNode?.name, data.sourceNode?.results]);

  // Update the resolveVariableUrl function to properly handle node data
  const resolveVariableUrl = useCallback((url: string) => {
    // If it's not a variable reference, return as is
    if (!url.match(/^\{\{.*\}\}$/)) return url;

    // Extract the variable path (e.g., "Cursor forum.Content[0]")
    const variablePath = url.replace(/^\{\{|\}\}$/g, '');
    
    // Split by dot but preserve array indices
    const parts = variablePath.split('.');
    const nodeName = parts[0];
    // Get selector name without the array index
    const selectorName = parts[1]?.split('[')[0];
    // Extract index if present
    const index = parts[1]?.match(/\[(\d+)\]/)?.[1];

    // Find the source node
    const sourceNode = nodes.find(n => {
      const nodeData = n.data as { label?: string };
      return nodeData.label === nodeName;
    });

    if (!sourceNode) {
      throw new Error(`Source node "${nodeName}" not found. Please check your variable reference.`);
    }
    
    const sourceData = sourceNode.data as { results?: string };
    if (!sourceData?.results) {
      throw new Error(`No results found from "${nodeName}". Please test that node's selectors first.`);
    }

    try {
      // Parse the results
      const results = JSON.parse(sourceData.results);
      
      // Handle results from multi-URL nodes
      if (results.bySelector) {
        if (!results.bySelector[selectorName]) {
          throw new Error(`No results found for selector "${selectorName}" in node "${nodeName}".`);
        }
        const selectorResults = results.bySelector[selectorName];
        if (!Array.isArray(selectorResults)) {
          throw new Error(`Invalid results format from "${nodeName}".`);
        }
        // Get the specific index if provided, otherwise first result
        const resultIndex = index ? parseInt(index) : 0;
        const result = selectorResults[resultIndex];
        if (!result) {
          throw new Error(`No result found at index [${index}] for selector "${selectorName}".`);
        }
        return result;
      }
      
      // Handle results from single scraping nodes
      if (Array.isArray(results)) {
        const resultIndex = index ? parseInt(index) : 0;
        const result = results[resultIndex];
        if (!result) {
          throw new Error(`No result found at index [${index}] in node "${nodeName}".`);
        }
        return result[selectorName] || result;
      }
      
      throw new Error(`Invalid results format from "${nodeName}".`);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Failed to process results from "${nodeName}".`);
    }
  }, [nodes]);

  const processUrlTemplate = useCallback((template: string, url: string) => {
    if (!template || !template.trim()) return url;
    
    try {
      // First resolve any variables in the URL
      const resolvedUrl = resolveVariableUrl(url);
      
      // Convert array result to string if needed
      const urlString = Array.isArray(resolvedUrl) ? resolvedUrl[0] : resolvedUrl;
      
      // If the URL is still a variable reference, return it
      if (typeof urlString === 'string' && urlString.match(/^\{\{.*\}\}$/)) return urlString;

      // If the URL is already absolute, return it
      if (typeof urlString === 'string' && urlString.match(/^https?:\/\//)) return urlString;

      // Get the base URL from the template (everything before the variable)
      const baseUrl = template.split(/\{\{.*?\}/)[0].replace(/\/$/, '');
      
      // Clean up the path
      const cleanPath = typeof urlString === 'string' 
        ? urlString.replace(/^\/+/, '').replace(/\/$/, '')
        : urlString;
      
      // Combine them
      const combined = `${baseUrl}/${cleanPath}`;
      
      // Validate and return
      if (validateURL(combined)) {
        return combined;
      }

      throw new Error(`Could not create valid URL from template: ${template} and URL: ${urlString}`);
    } catch (error) {
      throw error;
    }
  }, [resolveVariableUrl]);

  const handleTestSelector = async (index: number) => {
    try {
      setTestingSelector(index);
      setLastTestedSelector(index);

      if (!data.urls || data.urls.length === 0) {
        throw new Error("Please add at least one URL in the URLs tab before testing");
      }

      // Get the first URL and resolve any variables
      const firstUrl = data.urls[0];
      
      // First try to resolve the variable
      const resolvedUrl = resolveVariableUrl(firstUrl);
      
      // Then apply the template
      const testUrl = processUrlTemplate(data.template ?? "", firstUrl);

      if (!testUrl || !validateURL(testUrl)) {
        throw new Error(`Invalid URL after processing: ${testUrl}. Please check your URL and template.`);
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

      const response = await testScraping({
        variables: {
          url: testUrl,
          selectors: [{
            selector: normalizedSelector.selector,
            selectorType: normalizedSelector.selectorType.toLowerCase() as "css" | "xpath",
            attributes: normalizedSelector.attributes,
            name: normalizedSelector.name,
            description: normalizedSelector.description
          }]
        }
      });

      if (response.data?.testScraping.success) {
        // Store results in both the local state and node data
        const results = response.data.testScraping.results;
        
        // Update local test results
        setTestResults(prev => ({
          ...prev,
          [index]: results
        }));

        // Store results in node data
        const nodeResults = {
          bySelector: {
            [normalizedSelector.name]: results
          }
        };

        // Update the node's data with the results
        handleConfigChange("results", JSON.stringify(nodeResults));

        toast({
          title: "Test Successful",
          description: `Found ${results.length} matches`
        });
        return results;
      } else {
        toast({
          title: "Test Failed",
          description: response.data.testScraping.error || "Unknown error",
          variant: "destructive"
        });
        setLastTestedSelector(null);
        return null;
      }
    } catch (error) {
      console.error("Error testing selector:", error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setLastTestedSelector(null);
      return null;
    } finally {
      setTestingSelector(null);
    }
  };



  // Update the condition to check for undefined
  const isValid = data.urls?.length && data.selectors?.length;


  // Update the selector handling
  const handleUpdateSelectors = (selectors: SelectorConfigType[]) => {
    handleConfigChange("selectors", selectors.map(selector => ({
      ...selector,
      selectorType: selector.selectorType as SelectorType
    })));
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
                  isValid && "ring-2 ring-blue-500/50"
                )}
              >
                <MultiURLScrapingIcon />
                {(data.label as string | undefined) && (
                  <div className='absolute -bottom-6 text-xs text-gray-600 font-medium'>
                    {data.label as string}
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
                        value={(data.label as string | undefined) || ""}
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

                    </div>
                  </TabsContent>

                  <TabsContent value='selectors' className='space-y-4'>
                    <SelectorEditor
                      selectors={data.selectors || []}
                      onUpdateSelectors={handleUpdateSelectors}
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
