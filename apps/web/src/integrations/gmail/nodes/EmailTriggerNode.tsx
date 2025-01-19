import { Handle, Position } from 'reactflow';
import { BaseNode } from '../../../components/workflow/BaseNode';
import { EmailData } from '../service';

interface EmailTriggerNodeData {
  label: string;
  emails: EmailData[];
}

export function EmailTriggerNode({ data }: { data: EmailTriggerNodeData }) {
  return (
    <BaseNode label={data.label}>
      <div className="p-4">
        <div className="text-sm text-gray-600">
          {data.emails?.length > 0 ? (
            <div>
              {data.emails.map((email) => (
                <div key={email.id} className="mb-2">
                  <div>From: {email.from}</div>
                  <div>Subject: {email.subject}</div>
                  <div>Snippet: {email.snippet}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>No emails found</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
} 
