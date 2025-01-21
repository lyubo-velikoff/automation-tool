import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

interface AddNodeButtonProps {
  onAddNode: (type: string) => void;
}

const nodeOptions = [
  {
    type: "GMAIL_TRIGGER",
    label: "Gmail Trigger",
    description: "Trigger on new emails"
  },
  {
    type: "GMAIL_ACTION",
    label: "Gmail Action",
    description: "Send emails"
  },
  {
    type: "OPENAI",
    label: "OpenAI",
    description: "Generate text with AI"
  },
  {
    type: "SCRAPING",
    label: "Web Scraping",
    description: "Extract data from websites"
  }
];

export default function AddNodeButton({ onAddNode }: AddNodeButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Plus className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {nodeOptions.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => onAddNode(option.type)}
          >
            <div>
              <div className='font-medium'>{option.label}</div>
              <p className='text-sm text-muted-foreground'>
                {option.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
