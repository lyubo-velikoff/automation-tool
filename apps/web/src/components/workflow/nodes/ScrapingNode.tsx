import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useCallback } from 'react';

interface ScrapingNodeData {
  url: string;
  selector: string;
  selectorType: 'css' | 'xpath';
  attribute?: string;
  results?: string[];
}

interface ScrapingNodeProps {
  id: string;
  data: ScrapingNodeData & {
    onConfigChange: (nodeId: string, data: ScrapingNodeData) => void;
  };
}

export function ScrapingNode({ id, data }: ScrapingNodeProps) {
  const handleChange = useCallback((field: keyof ScrapingNodeData, value: string) => {
    data.onConfigChange(id, {
      ...data,
      [field]: value,
    });
  }, [data, id]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Web Scraping</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="url">URL to Scrape</Label>
          <Input
            id="url"
            value={data.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <Label htmlFor="selectorType">Selector Type</Label>
          <Select
            value={data.selectorType || 'css'}
            onValueChange={(value) => handleChange('selectorType', value as 'css' | 'xpath')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="css">CSS Selector</SelectItem>
              <SelectItem value="xpath">XPath</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="selector">Selector</Label>
          <Input
            id="selector"
            value={data.selector || ''}
            onChange={(e) => handleChange('selector', e.target.value)}
            placeholder={data.selectorType === 'css' ? '.article h1' : '//h1'}
          />
        </div>

        <div>
          <Label htmlFor="attribute">Attribute (Optional)</Label>
          <Input
            id="attribute"
            value={data.attribute || ''}
            onChange={(e) => handleChange('attribute', e.target.value)}
            placeholder="href"
          />
        </div>

        {data.results && data.results.length > 0 && (
          <div className="mt-4">
            <Label>Latest Results</Label>
            <div className="mt-2 p-2 bg-muted rounded-md max-h-[200px] overflow-auto">
              <ul className="list-disc list-inside space-y-1">
                {data.results.map((result, index) => (
                  <li key={index} className="text-sm truncate">
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
} 
