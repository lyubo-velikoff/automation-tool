import { Node, Edge } from 'reactflow';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  label?: string;
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
  selectorType?: 'css' | 'xpath';
  attribute?: string;
  
  // Common fields
  onConfigChange?: (nodeId: string, data: NodeData) => void;
}

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge; 
