import * as wf from '@temporalio/workflow';
import type { WorkflowNode, WorkflowEdge } from '../../types/workflow';

export interface TimedWorkflowInput {
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  intervalMinutes: number;
}

const { executeNode } = wf.proxyActivities({
  startToCloseTimeout: '1 minute',
});

export async function timedWorkflow(input: TimedWorkflowInput): Promise<void> {
  const { workflowId, nodes, edges, intervalMinutes } = input;

  // Create a timer that fires every intervalMinutes
  while (true) {
    // Execute nodes in topological order
    const executedNodes = new Set<string>();
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // Helper function to get node dependencies
    const getDependencies = (nodeId: string): string[] => {
      return edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);
    };

    // Execute nodes in order
    for (const node of nodes) {
      const dependencies = getDependencies(node.id);
      const canExecute = dependencies.every(depId => executedNodes.has(depId));

      if (canExecute) {
        try {
          await executeNode(node);
          executedNodes.add(node.id);
        } catch (error) {
          // Log error but continue with other nodes
          console.error(`Error executing node ${node.id}:`, error);
        }
      }
    }

    // Wait for the next interval
    await wf.sleep(intervalMinutes * 60 * 1000);
  }
} 
