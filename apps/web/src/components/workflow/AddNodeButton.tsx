import { useCallback } from 'react';
import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle } from 'lucide-react';

interface AddNodeButtonProps {
  onAddNode: (node: Node) => void;
}

export default function AddNodeButton({ onAddNode }: AddNodeButtonProps) {
  const addGmailTrigger = useCallback(() => {
    const newNode = {
      id: `gmail-trigger-${Date.now()}`,
      type: 'gmailTrigger',
      position: { x: 100, y: 100 },
      data: {
        label: 'Gmail Trigger',
        pollingInterval: 5,
        fromFilter: '',
        subjectFilter: '',
      }
    };
    onAddNode(newNode);
  }, [onAddNode]);

  const addGmailAction = useCallback(() => {
    const newNode = {
      id: `gmail-action-${Date.now()}`,
      type: 'gmailAction',
      position: { x: 100, y: 100 },
      data: {
        label: 'Send Email',
        to: 'lyubo.velikoff@gmail.com',
        subject: 'Test',
        body: 'Testing',
      }
    };
    onAddNode(newNode);
  }, [onAddNode]);

  const addOpenAICompletion = useCallback(() => {
    const newNode = {
      id: `openai-completion-${Date.now()}`,
      type: 'openaiCompletion',
      position: { x: 100, y: 100 },
      data: {
        label: 'AI Completion',
        prompt: '',
        model: 'gpt-3.5-turbo',
        maxTokens: 100,
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
        <DropdownMenuItem onClick={addOpenAICompletion}>
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          AI Completion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
