"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_WORKFLOW } from "@/graphql/mutations";
import { GET_WORKFLOW_TAGS } from "@/graphql/queries";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Textarea } from "@/components/ui/inputs/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/form/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/layout/dialog";
import { Mail, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowTag } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/overlays/dropdown-menu";
import { toast } from "sonner";

// Predefined templates
const WORKFLOW_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Workflow",
    description: "Start from scratch",
    icon: "Plus",
    nodes: [],
    edges: []
  },
  {
    id: "email",
    name: "Email Automation",
    description: "Automate email processing",
    icon: "Mail",
    nodes: [
      {
        id: "1",
        type: "gmail-trigger",
        position: { x: 100, y: 100 },
        data: {
          pollingInterval: 300,
          fromFilter: "",
          subjectFilter: ""
        }
      },
      {
        id: "2",
        type: "openai",
        position: { x: 400, y: 100 },
        data: {
          prompt: "Analyze the email content and generate a response",
          model: "gpt-3.5-turbo",
          maxTokens: 500
        }
      },
      {
        id: "3",
        type: "gmail-action",
        position: { x: 700, y: 100 },
        data: {
          to: "",
          subject: "",
          body: ""
        }
      }
    ],
    edges: [
      {
        id: "e1-2",
        source: "1",
        target: "2"
      },
      {
        id: "e2-3",
        source: "2",
        target: "3"
      }
    ]
  },
  {
    id: "web-scraping",
    name: "Web Scraping",
    description: "Scrape web content and process with AI",
    icon: Plus,
    nodes: [
      {
        id: "scraping",
        type: "SCRAPING",
        label: "Web Scraper",
        position: { x: 100, y: 100 },
        data: {
          url: "",
          selector: "",
          selectorType: "css",
          attribute: "text"
        }
      },
      {
        id: "openai-analyze",
        type: "openaiCompletion",
        label: "Analyze Content",
        position: { x: 400, y: 100 },
        data: {
          model: "gpt-3.5-turbo",
          maxTokens: 150
        }
      }
    ],
    edges: [
      {
        id: "e1-2",
        source: "scraping",
        target: "openai-analyze"
      }
    ]
  }
];

export function CreateWorkflowDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const router = useRouter();
  const [createWorkflow] = useMutation(CREATE_WORKFLOW);
  const { data: tagsData } = useQuery(GET_WORKFLOW_TAGS);

  const handleCreate = async () => {
    if (!name) return;

    try {
      const template = WORKFLOW_TEMPLATES.find(
        (t) => t.id === selectedTemplate
      );
      const { data } = await createWorkflow({
        variables: {
          input: {
            name,
            description,
            nodes: template?.nodes || [],
            edges: template?.edges || [],
            tag_ids: selectedTags
          }
        }
      });

      if (data?.createWorkflow) {
        toast({
          title: "Success",
          description: "Workflow created successfully"
        });
        router.push(`/workflows/${data.createWorkflow.id}`);
      }
    } catch (error) {
      toast.error("Failed to create workflow");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Create a new workflow from scratch or use a template.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              placeholder='My Workflow'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Describe what this workflow does...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Template</Label>
            <RadioGroup
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <div className='grid grid-cols-2 gap-4'>
                {WORKFLOW_TEMPLATES.map((template) => (
                  <div key={template.id} className='relative'>
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className='peer sr-only'
                    />
                    <Label
                      htmlFor={template.id}
                      className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                    >
                      <div className='mb-2'>
                        {template.icon === "Mail" ? (
                          <Mail className='h-6 w-6' />
                        ) : (
                          <Plus className='h-6 w-6' />
                        )}
                      </div>
                      <div className='text-center'>
                        <div className='font-medium'>{template.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          {template.description}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className='space-y-2'>
            <Label>Tags</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    "justify-start text-left font-normal",
                    selectedTags.length === 0 && "text-muted-foreground"
                  )}
                >
                  <Tag className='mr-2 h-4 w-4' />
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tag${
                        selectedTags.length === 1 ? "" : "s"
                      } selected`
                    : "Select tags"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-[200px]'>
                {tagsData?.workflowTags?.map((tag: WorkflowTag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked: boolean) => {
                      setSelectedTags(
                        checked
                          ? [...selectedTags, tag.id]
                          : selectedTags.filter((id) => id !== tag.id)
                      );
                    }}
                  >
                    <div className='flex items-center'>
                      <div
                        className='w-2 h-2 rounded-full mr-2'
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
