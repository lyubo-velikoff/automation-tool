import { proxyActivities } from '@temporalio/workflow';
import type { WorkflowNode, WorkflowEdge } from '../../types/workflow';
import * as activities from '../activities/nodeActivities';

const { executeNode } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

interface TimedWorkflowInput {
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  intervalMinutes: number;
  userId: string;
  gmailToken?: string;
}

export async function timedWorkflow(input: TimedWorkflowInput): Promise<void> {
  const { nodes, edges, intervalMinutes, userId, gmailToken } = input;

  while (true) {
    console.log('Executing timed workflow iteration');

    // Create a map of node connections
    const nodeConnections = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!nodeConnections.has(edge.source)) {
        nodeConnections.set(edge.source, []);
      }
      nodeConnections.get(edge.source)!.push(edge.target);
    });

    // Find start nodes (nodes with no incoming edges)
    const startNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    // Execute starting from each start node
    for (const startNode of startNodes) {
      try {
        await executeNode(startNode, userId, gmailToken);

        // Execute connected nodes
        const processConnectedNodes = async (nodeId: string) => {
          const nextNodes = nodeConnections.get(nodeId) || [];
          for (const nextNodeId of nextNodes) {
            const nextNode = nodes.find(n => n.id === nextNodeId);
            if (nextNode) {
              await executeNode(nextNode, userId, gmailToken);
              await processConnectedNodes(nextNode.id);
            }
          }
        };

        await processConnectedNodes(startNode.id);
      } catch (error) {
        console.error(`Error executing node ${startNode.id}:`, error);
      }
    }

    // Wait for the specified interval before next execution
    await new Promise(resolve => setTimeout(resolve, intervalMinutes * 60 * 1000));
  }
} 
