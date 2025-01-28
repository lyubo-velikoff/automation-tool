import { Card as SelectorCard } from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/data-display/separator";
import { Textarea } from "@/components/ui/inputs/textarea";

interface SelectorEditorProps {
  selectors: SelectorConfig[];
  template?: string;
  testResults?: string[];
  isLoading?: boolean;
  onUpdateSelectors: (selectors: SelectorConfig[]) => void;
  onUpdateTemplate: (template: string) => void;
  onTestSelector: (index: number) => void;
}

export function SelectorEditor({
  selectors,
  template,
  testResults,
  isLoading,
  onUpdateSelectors,
  onUpdateTemplate,
  onTestSelector
}: SelectorEditorProps) {
  const handleAddSelector = () => {
    const newSelectors = [...selectors];
    newSelectors.push({
      selector: "",
      selectorType: "css",
      attributes: ["text"],
      name: `Selector ${newSelectors.length + 1}`
    });
    onUpdateSelectors(newSelectors);
  };

  const handleRemoveSelector = (index: number) => {
    const newSelectors = [...selectors];
    newSelectors.splice(index, 1);
    onUpdateSelectors(newSelectors);
  };

  const handleUpdateSelector = (
    index: number,
    updates: Partial<SelectorConfig>
  ) => {
    const newSelectors = [...selectors];
    newSelectors[index] = {
      ...newSelectors[index],
      ...updates
    };
    onUpdateSelectors(newSelectors);
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        {selectors.map((selector, index) => (
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
                    onClick={() => onTestSelector(index)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      "Test"
                    )}
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

              <div className='space-y-4'>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={selector.name || ""}
                    onChange={(e) =>
                      handleUpdateSelector(index, { name: e.target.value })
                    }
                    placeholder='e.g., Title, Content'
                  />
                </div>

                <div>
                  <Label>Selector</Label>
                  <Input
                    value={selector.selector}
                    onChange={(e) =>
                      handleUpdateSelector(index, { selector: e.target.value })
                    }
                    placeholder={
                      selector.selectorType === "css"
                        ? "#topic-title h1 a"
                        : "//div[@id='topic-title']//h1/a"
                    }
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={selector.selectorType}
                      onValueChange={(value) =>
                        handleUpdateSelector(index, {
                          selectorType: value as "css" | "xpath"
                        })
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
                  <div>
                    <Label>Attributes</Label>
                    <Select
                      value={selector.attributes[0]}
                      onValueChange={(value) =>
                        handleUpdateSelector(index, { attributes: [value] })
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
              </div>
            </div>
          </SelectorCard>
        ))}
      </div>

      <Button onClick={handleAddSelector} variant='outline' className='w-full'>
        <Plus className='h-4 w-4 mr-2' />
        Add Selector
      </Button>

      <Separator className='my-4' />

      <div className='space-y-4'>
        <div>
          <Label>Output Template</Label>
          <Textarea
            value={template || ""}
            onChange={(e) => onUpdateTemplate(e.target.value)}
            placeholder='Example:
Title: {{Title}}
URL: {{url}}
Content: {{Content}}'
            rows={4}
            className='font-mono text-sm'
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Use double curly braces and exact selector name (e.g.,{" "}
            {"{{Content}}"}) to reference selector outputs. Available variables:{" "}
            {"{{url}}"} and your selector names (case-sensitive).
          </p>
        </div>

        {testResults && testResults.length > 0 && (
          <div>
            <Label>Test Results</Label>
            <div className='mt-2 p-2 bg-muted rounded-md'>
              <pre className='whitespace-pre-wrap text-sm'>
                {testResults.slice(0, 5).join("\n\n")}
                {testResults.length > 5 &&
                  "\n\n...and " + (testResults.length - 5) + " more results"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
