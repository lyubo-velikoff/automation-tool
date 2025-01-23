import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Input } from '@/components/ui/inputs/input';
import { Label } from '@/components/ui/inputs/label';
import { Textarea } from '@/components/ui/inputs/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/inputs/select';

export interface CompletionConfig {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface OpenAICompletionNodeProps {
  data: CompletionConfig & {
    onConfigChange: (config: CompletionConfig) => void;
  };
}

export default function OpenAICompletionNode({ data }: OpenAICompletionNodeProps) {
  const handleConfigChange = (key: keyof CompletionConfig, value: string | number) => {
    data.onConfigChange({
      ...data,
      [key]: value,
    });
  };

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          AI Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="model">Model</Label>
          <Select
            value={data.model || 'gpt-3.5-turbo'}
            onValueChange={(value) => handleConfigChange('model', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={data.prompt || ''}
            onChange={(e) => handleConfigChange('prompt', e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Supports variables: {'{{'}<span>variable_name</span>{'}}'}
          </p>
        </div>
        <div>
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={data.maxTokens || 1024}
            onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
            min={1}
            max={4096}
          />
        </div>
        <div>
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            type="number"
            value={data.temperature || 0.7}
            onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
            min={0}
            max={2}
            step={0.1}
          />
        </div>
      </CardContent>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
} 
