import { Worker } from '@temporalio/worker';
import * as activities from './activities/nodeActivities';
import { timedWorkflow } from './workflows/timedWorkflow';

export async function runWorker() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows/timedWorkflow'),
    activities,
    taskQueue: 'automation-tool',
  });

  console.log('Starting Temporal worker...');
  await worker.run();
} 
