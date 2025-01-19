import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus } from 'lucide-react';
import { Node } from 'reactflow';

interface AddNodeButtonProps {
  onAddNode: (node: Node) => void;
}

const nodeOptions = [
  {
    type: 'GMAIL_TRIGGER',
    label: 'Gmail Trigger',
    description: 'Trigger on new emails',
  },
  {
    type: 'GMAIL_ACTION',
    label: 'Gmail Action',
    description: 'Send emails',
  },
  {
    type: 'OPENAI',
    label: 'OpenAI',
    description: 'Generate text with AI',
  },
  {
    type: 'SCRAPING',
    label: 'Web Scraping',
    description: 'Extract data from websites',
  },
];

export default function AddNodeButton({ onAddNode }: AddNodeButtonProps) {
  const handleAddNode = (type: string) => {
    const option = nodeOptions.find(opt => opt.type === type);
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: {
        label: option?.label || 'Untitled Node',
        ...(type === 'SCRAPING' ? {
          url: '',
          selector: '',
          selectorType: 'css',
          attribute: '',
        } : {}),
      },
    };
    onAddNode(newNode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {nodeOptions.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => handleAddNode(option.type)}
          >
            <div>
              <div className="font-medium">{option.label}</div>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
