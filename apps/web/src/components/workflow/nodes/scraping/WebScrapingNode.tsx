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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/data-display/table";
import { Card as SelectorCard } from "@/components/ui/layout/card";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/data-display/separator";
import { Badge } from "@/components/ui/data-display/badge";
import { SelectorEditor } from "./components/SelectorEditor";
import { NodeData as BaseNodeData } from "../../config/nodeTypes";
import { useMutation } from "@apollo/client";
import { TEST_SCRAPING } from "@/graphql/scraping";
import {
  SelectorConfigInput,
  NodeData as GraphQLNodeData,
  SelectorConfigType,
  TestScrapingMutation,
  TestScrapingMutationVariables
} from "@/gql/graphql";
import { useToast } from "@/hooks/use-toast";

interface NodeData extends Omit<GraphQLNodeData, "__typename"> {
  selectors: SelectorConfigType[];
  template: string;
  onConfigChange?: (data: NodeData) => void;
}

interface WebScrapingNodeProps {
  id: string;
  data: BaseNodeData;
  selected: boolean;
  type: string;
  isConnectable: boolean;
}

const WebScrapingIcon: React.FC = memo(() => {
  return (
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
  );
});
WebScrapingIcon.displayName = "WebScrapingIcon";

// Convert incoming GraphQL data to our UI format
function convertIncomingData(data: GraphQLNodeData): NodeData {
  return {
    ...data,
    selectors: data.selectors || [
      {
        name: data.label || "Content",
        selector: "a.title.raw-link.raw-topic-link",
        selectorType: "css",
        attributes: ["text", "href"],
        description: "Cursor forum topic links"
      }
    ],
    template: data.template || "{{Content}}"
  } as NodeData;
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

interface TestResults {
  [key: number]: string[][];
}

function WebScrapingNode({
  id,
  data,
  selected,
  type,
  isConnectable
}: WebScrapingNodeProps) {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResults>({});
  const [testScraping, { loading: isLoading }] = useMutation<
    TestScrapingMutation,
    TestScrapingMutationVariables
  >(TEST_SCRAPING);

  const handleConfigChange = useCallback(
    (key: string, value: any) => {
      if (!data.onConfigChange) return;

      const newData = { ...data };
      if (key === "selectors") {
        newData.selectors = value.map((selector: any) => ({
          selector: selector.selector,
          selectorType: selector.selectorType,
          attributes: selector.attributes,
          name: selector.name,
          description: selector.description
        }));
      } else if (key === "label") {
        newData.label = value;
        // Ensure the label is updated in both places
        data.onConfigChange(id, {
          ...newData,
          label: value
        });
        return;
      } else {
        (newData as any)[key] = value;
      }

      data.onConfigChange(id, newData);
    },
    [data, id]
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
    try {
      const selector = nodeData.selectors[index];
      const { data } = await testScraping({
        variables: {
          url: nodeData.url || "",
          selectors: [
            {
              selector: selector.selector,
              selectorType: selector.selectorType,
              attributes: selector.attributes,
              name: selector.name,
              description: selector.description
            }
          ]
        }
      });

      if (data?.testScraping.success) {
        setTestResults(data.testScraping.results);
      } else {
        setTestResults([
          ["Error: " + (data?.testScraping.error || "Unknown error")]
        ]);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setTestResults([["Error: " + errorMessage]]);
    }
  };

  const handleTestSelector = async (index: number) => {
    try {
      const selector = nodeData.selectors[index];
      const { data: mutationData } = await testScraping({
        variables: {
          url: nodeData.url || "",
          selectors: [
            {
              selector: selector.selector,
              selectorType: selector.selectorType,
              attributes: selector.attributes,
              name: selector.name,
              description: selector.description
            }
          ]
        }
      });

      if (mutationData?.testScraping.success) {
        setTestResults((prev) => ({
          ...prev,
          [index]: mutationData.testScraping.results
        }));

        // Store results in node data
        handleConfigChange(
          "results",
          JSON.stringify({
            bySelector: {
              [selector.name]: mutationData.testScraping.results
            }
          })
        );

        toast({
          title: "Test Successful",
          description: `Found ${mutationData.testScraping.results.length} matches`
        });
      } else {
        setTestResults((prev) => ({
          ...prev,
          [index]: [
            ["Error: " + (mutationData?.testScraping.error || "Unknown error")]
          ]
        }));

        toast({
          title: "Test Failed",
          description: mutationData?.testScraping.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setTestResults((prev) => ({
        ...prev,
        [index]: [["Error: " + errorMessage]]
      }));

      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Convert test results for the selector editor
  const currentTestResults =
    nodeData.selectors.length > 0 ? testResults[0] || [] : [];

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
          className='w-[600px] max-h-[80vh] overflow-y-auto'
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
                    testResults={currentTestResults}
                    isLoading={isLoading}
                    onUpdateSelectors={(selectors) =>
                      handleConfigChange("selectors", selectors)
                    }
                    onUpdateTemplate={(template) =>
                      handleConfigChange("template", template)
                    }
                    onTestSelector={handleTestSelector}
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
