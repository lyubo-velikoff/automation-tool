import 'dotenv/config';
import fetch from 'node-fetch';
import { supabase } from '../lib/supabase';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

const CREATE_WORKFLOW = `
mutation CreateWorkflow($input: CreateWorkflowInput!) {
  createWorkflow(input: $input) {
    id
  }
}`;

const EXECUTE_WORKFLOW = `
mutation ExecuteWorkflow($workflowId: String!) {
  executeWorkflow(workflowId: $workflowId) {
    success
    message
    results {
      nodeId
      status
      results
    }
  }
}`;

async function runGraphQLQuery(query: string, variables: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('Sending GraphQL request:', {
    query,
    variables,
    headers
  });

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  const data = await response.json();
  console.log('GraphQL response:', JSON.stringify(data, null, 2));

  if (data.errors) {
    console.error('GraphQL Errors:', data.errors);
    return null;
  }
  return data.data;
}

async function getTestAuthToken() {
  try {
    // Try to sign in with the test user
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123456'
    });

    if (signInError) {
      // If sign in fails, try to create the user
      const { data: { user }, error: adminError } = await supabase.auth.admin.createUser({
        email: 'test@example.com',
        password: 'test123456',
        email_confirm: true
      });

      if (adminError) {
        throw adminError;
      }

      // Sign in with the created user
      const { data: { session: newSession }, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456'
      });

      if (newSignInError) {
        throw newSignInError;
      }

      return newSession?.access_token;
    }

    return session?.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function runTest(description: string, url: string, selector: string, selectorType: string, attributes: string[], template: string) {
  console.log(`\nTesting: ${description}`);
  console.log('Configuration:', { url, selector, selectorType, attributes, template });

  // Get auth token
  const token = await getTestAuthToken();
  if (!token) {
    console.error('Failed to get auth token');
    return;
  }

  // Create workflow
  console.log('\nCreating workflow...');
  const workflowInput = {
    input: {
      name: `Test Workflow - ${description}`,
      nodes: [{
        id: '1',
        type: 'SCRAPING',
        label: 'Web Scraping',
        position: { x: 0, y: 0 },
        data: {
          url,
          selector,
          selectorType,
          attributes,
          template
        }
      }],
      edges: []
    }
  };
  console.log('Workflow input:', JSON.stringify(workflowInput, null, 2));

  const createResult = await runGraphQLQuery(CREATE_WORKFLOW, workflowInput, token);

  if (!createResult) {
    console.log('❌ Failed to create workflow');
    return;
  }

  const workflowId = createResult.createWorkflow.id;
  console.log('✅ Workflow created with ID:', workflowId);

  // Execute workflow
  console.log('\nExecuting workflow...');
  const executeResult = await runGraphQLQuery(EXECUTE_WORKFLOW, {
    workflowId
  }, token);

  if (!executeResult) {
    console.log('❌ Failed to execute workflow');
    return;
  }

  console.log('Execution results:', JSON.stringify(executeResult.executeWorkflow, null, 2));
}

async function main() {
  // Test Case: Cursor Forum Posts
  await runTest(
    'Cursor Forum Posts',
    'https://forum.cursor.com',
    'td a.raw-topic-link',  // Correct selector for forum posts
    'css',
    ['text', 'href'],
    '[{text}]({href})'
  );
}

main().catch(console.error); 
