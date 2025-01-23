import { BasicNode } from "@/components/ui/data-display/basic-node";
import GmailActionNode from "../nodes/gmail/GmailActionNode";
import GmailTriggerNode from "../nodes/gmail/GmailTriggerNode";

export interface NodeData {
  // Gmail fields
  to?: string;
  subject?: string;
  body?: string;
  fromFilter?: string;
  subjectFilter?: string;
  pollingInterval?: string | number;

  // OpenAI fields
  prompt?: string;
  model?: string;
  maxTokens?: string | number;

  // Scraping fields
  url?: string;
  selector?: string;
  selectorType?: "css" | "xpath";
  attribute?: string;

  // Common fields
  onConfigChange?: (nodeId: string, data: NodeData) => void;
  label?: string;
} 


// Memoized node component
export const NODE_TYPES = {
  GMAIL_ACTION: GmailActionNode,
  GMAIL_TRIGGER: GmailTriggerNode,
  OPENAI: BasicNode,
  SCRAPING: BasicNode,
  default: BasicNode
} as const;

export type NodeType = keyof typeof NODE_TYPES;
