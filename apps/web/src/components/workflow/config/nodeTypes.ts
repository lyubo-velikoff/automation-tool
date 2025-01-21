import { BasicNode } from "../nodeTypes";

export const NODE_TYPES = {
  GMAIL_ACTION: BasicNode,
  GMAIL_TRIGGER: BasicNode,
  OPENAI: BasicNode,
  SCRAPING: BasicNode,
  default: BasicNode
} as const;

export type NodeType = keyof typeof NODE_TYPES;

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
