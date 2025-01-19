import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TriggerConfig {
  pollingInterval: number;
  fromFilter?: string;
  subjectFilter?: string;
}

interface GmailTriggerNodeProps {
  data: TriggerConfig & {
    onConfigChange: (config: TriggerConfig) => void;
  };
}

export default function GmailTriggerNode({ data }: GmailTriggerNodeProps) {
  const handleConfigChange = (key: keyof TriggerConfig, value: string | number) => {
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
            <path d="M22 4H2v16h20V4zM2 8l10 6 10-6" />
          </svg>
          Gmail Trigger
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="pollingInterval">Check every (minutes)</Label>
          <Input
            id="pollingInterval"
            type="number"
            value={data.pollingInterval}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('pollingInterval', parseInt(e.target.value))
            }
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="fromFilter">From (optional)</Label>
          <Input
            id="fromFilter"
            value={data.fromFilter || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('fromFilter', e.target.value)
            }
            placeholder="sender@example.com"
          />
        </div>
        <div>
          <Label htmlFor="subjectFilter">Subject contains (optional)</Label>
          <Input
            id="subjectFilter"
            value={data.subjectFilter || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('subjectFilter', e.target.value)
            }
            placeholder="Important"
          />
        </div>
      </CardContent>
      <Handle type="source" position={Position.Right} />
    </Card>
  );
} 
