"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { CREATE_WORKFLOW } from "@/graphql/mutations";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/layout/dialog";
import { Label } from "@/components/ui/inputs/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Mail, Globe } from "lucide-react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/form/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/layout/card";

// Predefined templates
const WORKFLOW_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Workflow",
    description: "Start with a clean slate",
    icon: Plus,
    nodes: [],
    edges: []
  },
  {
    id: "email-automation",
    name: "Email Automation",
    description: "Monitor emails and trigger actions based on content",
    icon: Mail,
    nodes: [
      {
        id: "gmail-trigger",
        type: "GMAIL_TRIGGER",
        label: "Gmail Monitor",
        position: { x: 100, y: 100 },
        data: {
          pollingInterval: 5,
          fromFilter: "",
          subjectFilter: ""
        }
      },
      {
        id: "openai-process",
        type: "openaiCompletion",
        label: "Process with AI",
        position: { x: 400, y: 100 },
        data: {
          model: "gpt-3.5-turbo",
          maxTokens: 100
        }
      },
      {
        id: "gmail-action",
        type: "GMAIL_ACTION",
        label: "Send Email",
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
        source: "gmail-trigger",
        target: "openai-process"
      },
      {
        id: "e2-3",
        source: "openai-process",
        target: "gmail-action"
      }
    ]
  },
  {
    id: "web-scraping",
    name: "Web Scraping",
    description: "Scrape web content and process with AI",
    icon: Globe,
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [isLoading, setIsLoading] = useState(false);

  const [createWorkflow] = useMutation(CREATE_WORKFLOW, {
    refetchQueries: ["GetWorkflows"]
  });

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const template = WORKFLOW_TEMPLATES.find(
        (t) => t.id === selectedTemplate
      );

      const { data } = await createWorkflow({
        variables: {
          input: {
            name: name.trim(),
            description: description.trim(),
            nodes: template?.nodes || [],
            edges: template?.edges || []
          }
        }
      });

      if (!data?.createWorkflow) {
        throw new Error("Failed to create workflow");
      }

      toast({
        title: "Success",
        description: "Workflow created successfully"
      });

      // Navigate to the new workflow
      router.push(`/workflow/${data.createWorkflow.id}`);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='h-4 w-4 mr-2' />
          New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Create a new workflow and start adding automation steps.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-6 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter workflow name'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Enter workflow description'
              rows={3}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Choose a Template</Label>
            <RadioGroup
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              className='grid grid-cols-3 gap-4'
            >
              {WORKFLOW_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className={`relative cursor-pointer border-2 ${
                      selectedTemplate === template.id
                        ? "border-primary"
                        : "border-muted"
                    }`}
                  >
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className='sr-only'
                    />
                    <CardHeader>
                      <Icon className='h-8 w-8 mb-2' />
                      <CardTitle className='text-base'>
                        {template.name}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='text-xs text-muted-foreground'>
                      {template.nodes.length > 0 ? (
                        <>
                          {template.nodes.length} nodes
                          <br />
                          {template.edges.length} connections
                        </>
                      ) : (
                        "Empty workflow"
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
