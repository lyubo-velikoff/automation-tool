import { BasicNode } from "@/components/ui/data-display/basic-node";
import GmailActionNode from "../nodes/gmail/GmailActionNode";
import GmailTriggerNode from "../nodes/gmail/GmailTriggerNode";
import WebScrapingNode from "../nodes/scraping/WebScrapingNode";
import OpenAINode from "../nodes/openai/OpenAINode";

export interface NodeData {
  id?: string;
  label?: string;
  // Gmail fields
  subject?: string;
  body?: string;
  to?: string;
  // Scraping fields
  url?: string;
  selector?: string;
  selectorType?: string;
  attributes?: string[];
  template?: string;
  // OpenAI fields
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // Common fields
  onConfigChange?: (nodeId: string, data: NodeData) => void;
  fromFilter?: string;
  subjectFilter?: string;
  pollingInterval?: string | number;
  attribute?: string;
} 

// Memoized node components
export const NODE_TYPES = {
  GMAIL_TRIGGER: GmailTriggerNode,
  GMAIL_ACTION: GmailActionNode,
  SCRAPING: WebScrapingNode,
  OPENAI: OpenAINode,
  default: BasicNode
} as const;

export type NodeType = keyof typeof NODE_TYPES;
