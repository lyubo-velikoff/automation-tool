'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle } from 'lucide-react';
import { Node } from 'reactflow';
import { TriggerConfig } from './nodes/gmail/GmailTriggerNode';
import { EmailConfig } from './nodes/gmail/GmailActionNode';
import { useCallback } from 'react';

interface NodeData<T> {
  onConfigChange: (config: T) => void;
}

interface TriggerNodeData extends TriggerConfig, NodeData<TriggerConfig> {}
interface ActionNodeData extends EmailConfig, NodeData<EmailConfig> {}

interface NodeSelectorProps {
  onAddNode: (node: Node) => void;
}

export default function NodeSelector({ onAddNode }: NodeSelectorProps) {
  const addGmailTrigger = useCallback(() => {
    const newNode = {
      id: `gmail-trigger-${Date.now()}`,
      type: 'gmailTrigger',
      label: 'Gmail Trigger',
      position: { x: 100, y: 100 },
      data: {
        pollingInterval: 5,
        fromFilter: '',
        subjectFilter: ''
      }
    };
    onAddNode(newNode);
  }, [onAddNode]);

  const addGmailAction = useCallback(() => {
    const newNode = {
      id: `gmail-action-${Date.now()}`,
      type: 'gmailAction',
      label: 'Send Email',
      position: { x: 100, y: 100 },
      data: {
        to: '',
        subject: '',
        body: ''
      }
    };
    onAddNode(newNode);
  }, [onAddNode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Add node</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={addGmailTrigger}>
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
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
        </DropdownMenuItem>
        <DropdownMenuItem onClick={addGmailAction}>
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
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
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
