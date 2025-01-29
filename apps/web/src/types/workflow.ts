import { Node, Edge } from 'reactflow';
import { NodeData as NodeDataType, PositionType, WorkflowNode as WorkflowNodeType, WorkflowEdge as WorkflowEdgeType } from '@/gql/graphql';

export type { NodeDataType as NodeData, PositionType as Position };
export type WorkflowNode = Node<NodeDataType>;
export type WorkflowEdge = Edge;

// Re-export common types from graphql
export type { 
  Workflow,
  WorkflowTag,
  WorkflowTemplate,
  WorkflowExecution,
  BatchConfigType,
  SelectorConfigType,
  ScrapingResultType
} from '@/gql/graphql'; 
