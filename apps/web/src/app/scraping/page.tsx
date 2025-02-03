"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
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
import { Badge } from "@/components/ui/data-display/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@apollo/client";
import { TEST_SCRAPING } from "@/graphql/scraping";
import type {
  TestScrapingMutation,
  TestScrapingMutationVariables,
  SelectorConfigInput
} from "@/gql/graphql";

export default function ScrapingTestPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [selectors, setSelectors] = useState<SelectorConfigInput[]>([]);
  const [results, setResults] = useState<
    TestScrapingMutation["testScraping"] | null
  >(null);
  const [testScraping, { loading: isLoading }] = useMutation<
    TestScrapingMutation,
    TestScrapingMutationVariables
  >(TEST_SCRAPING);

  const addSelector = () => {
    setSelectors([
      ...selectors,
      {
        selector: "td a.raw-topic-link",
        selectorType: "css",
        attributes: ["text"],
        name: `selector_${selectors.length + 1}`,
        description: ""
      }
    ]);
  };

  const updateSelector = (
    index: number,
    field: keyof SelectorConfigInput,
    value: string | string[]
  ) => {
    const newSelectors = [...selectors];
    newSelectors[index] = { ...newSelectors[index], [field]: value };
    setSelectors(newSelectors);
  };

  const removeSelector = (index: number) => {
    setSelectors(selectors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectors.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one selector",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data } = await testScraping({
        variables: {
          url,
          selectors: selectors.map(selector => ({
            selector: selector.selector,
            selectorType: selector.selectorType,
            attributes: selector.attributes,
            name: selector.name,
            description: selector.description
          }))
        }
      });

      if (!data?.testScraping.success) {
        throw new Error(data?.testScraping.error || "Failed to scrape data");
      }

      setResults(data.testScraping);
      toast({
        title: "Success",
        description: "Scraping completed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to scrape data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='space-y-4'>
        <h1 className='text-2xl font-bold'>Web Scraping Test</h1>
        <p className='text-muted-foreground'>
          Test your web scraping selectors with CSS or XPath.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-4'>
          <label className='text-sm font-medium'>Target URL</label>
          <Input
            type='url'
            placeholder='https://example.com'
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
            required
          />
        </div>

        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <label className='text-sm font-medium'>Selectors</label>
            <Button type='button' variant='outline' onClick={addSelector}>
              Add Selector
            </Button>
          </div>

          {selectors.map((selector, index) => (
            <div key={index} className='border rounded-lg p-4 space-y-4'>
              <div className='flex justify-between'>
                <h3 className='font-medium'>Selector {index + 1}</h3>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeSelector(index)}
                >
                  Remove
                </Button>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm'>Name</label>
                  <Input
                    value={selector.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateSelector(index, "name", e.target.value)
                    }
                    placeholder='e.g., title'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm'>Selector Type</label>
                  <Select
                    value={selector.selectorType}
                    onValueChange={(value) =>
                      updateSelector(
                        index,
                        "selectorType",
                        value as "css" | "xpath"
                      )
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

                <div className='col-span-2 space-y-2'>
                  <label className='text-sm'>Selector</label>
                  <Input
                    value={selector.selector}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateSelector(index, "selector", e.target.value)
                    }
                    placeholder='td a.raw-topic-link'
                    required
                  />
                </div>

                <div className='col-span-2 space-y-2'>
                  <label className='text-sm'>Attributes to Extract</label>
                  <Select
                    value={selector.attributes.join(",")}
                    onValueChange={(value) =>
                      updateSelector(index, "attributes", value.split(","))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='text'>Text Content Only</SelectItem>
                      <SelectItem value='text,href'>Text + Link URL</SelectItem>
                      <SelectItem value='text,src'>
                        Text + Source URL
                      </SelectItem>
                      <SelectItem value='text,href,title'>
                        Text + Link URL + Title
                      </SelectItem>
                      <SelectItem value='text,html'>
                        Text + HTML Content
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='col-span-2 space-y-2'>
                  <label className='text-sm'>Description (optional)</label>
                  <Input
                    value={selector.description ?? ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateSelector(index, "description", e.target.value)
                    }
                    placeholder='What this selector extracts'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button type='submit' disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Selectors"}
        </Button>
      </form>

      {results && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Results</h2>
          <div className='border rounded-lg overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.results.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>{rowIndex + 1}</TableCell>
                    {row.map((value, colIndex) => (
                      <TableCell key={colIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
