import { BasicNode } from "@/components/ui/data-display/basic-node";
import GmailActionNode from "../nodes/gmail/GmailActionNode";
import GmailTriggerNode from "../nodes/gmail/GmailTriggerNode";
import WebScrapingNode from "../nodes/scraping/WebScrapingNode";

export interface NodeData {
  // Gmail fields
  to?: string;
  subject?: string;
  body?: string;
  fromFilter?: string;
  subjectFilter?: string;
  pollingInterval?: string | number;

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
  SCRAPING: WebScrapingNode,
  default: BasicNode
} as const;

export type NodeType = keyof typeof NODE_TYPES;
