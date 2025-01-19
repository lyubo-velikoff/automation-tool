import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

interface GmailActionNodeProps {
  data: EmailConfig & {
    onConfigChange: (config: EmailConfig) => void;
  };
}

export default function GmailActionNode({ data }: GmailActionNodeProps) {
  const handleConfigChange = (key: keyof EmailConfig, value: string) => {
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
          Send Email
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            value={data.to}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('to', e.target.value)
            }
            placeholder="recipient@example.com"
          />
        </div>
        <div>
          <Label htmlFor="cc">CC (optional)</Label>
          <Input
            id="cc"
            value={data.cc || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('cc', e.target.value)
            }
            placeholder="cc@example.com"
          />
        </div>
        <div>
          <Label htmlFor="bcc">BCC (optional)</Label>
          <Input
            id="bcc"
            value={data.bcc || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('bcc', e.target.value)
            }
            placeholder="bcc@example.com"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={data.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleConfigChange('subject', e.target.value)
            }
            placeholder="Email subject"
          />
        </div>
        <div>
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={data.body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleConfigChange('body', e.target.value)
            }
            placeholder="Email body"
            rows={4}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Supports variables: {'{{'}<span>variable_name</span>{'}}'}
          </p>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  );
} 
