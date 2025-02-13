import { BasicNode } from "@/components/ui/data-display/basic-node";
import GmailActionNode from "../nodes/gmail/GmailActionNode";
import GmailTriggerNode from "../nodes/gmail/GmailTriggerNode";
import MultiURLScrapingNode from "../nodes/scraping/MultiURLScrapingNode";
import OpenAINode from "../nodes/openai/OpenAINode";
import { NodeData as BaseNodeData } from '@/gql/graphql';

// Extend the base NodeData type with our UI-specific fields
export interface NodeData extends BaseNodeData {
  onConfigChange?: (nodeId: string, data: NodeData) => void;
}

// Memoized node components
export const NODE_TYPES = {
  GMAIL_TRIGGER: GmailTriggerNode,
  GMAIL_ACTION: GmailActionNode,
  MULTI_URL_SCRAPING: MultiURLScrapingNode,
  OPENAI: OpenAINode,
  default: BasicNode
} as const;

export type NodeType = keyof typeof NODE_TYPES;
