import 'dotenv/config';
import fetch from 'node-fetch';
import { supabase } from '../lib/supabase';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

// GraphQL Queries/Mutations
const CREATE_WORKFLOW = `
mutation CreateWorkflow($input: CreateWorkflowInput!) {
  createWorkflow(input: $input) {
    id
    name
    description
    nodes {
      id
      type
      label
      position {
        x
        y
      }
      data {
        url
        selector
        selectorType
        attributes
        template
      }
    }
    edges {
      id
      source
      target
    }
    is_active
  }
}`;

const EXECUTE_WORKFLOW = `
mutation ExecuteWorkflow($workflowId: String!) {
  executeWorkflow(workflowId: $workflowId) {
    success
    message
    executionId
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

async function testWorkflowExecution() {
  console.log('Starting workflow execution test...');
  
  // Get auth token
  const token = await getTestAuthToken();
  if (!token) {
    console.error('Failed to get auth token');
    return;
  }

  // Test 1: Execute Simple Scraping Workflow
  console.log('\n1. Testing simple scraping workflow...');
  const scrapingWorkflowInput = {
    input: {
      name: 'Test Scraping Workflow',
      description: 'A workflow for testing scraping execution',
      nodes: [{
        id: '1',
        type: 'SCRAPING',
        label: 'Web Scraping',
        position: { x: 0, y: 0 },
        data: {
          url: 'https://example.com',
          selector: 'h1',
          selectorType: 'css',
          attributes: ['text'],
          template: '{text}'
        }
      }],
      edges: []
    }
  };

  // Create workflow
  const createResult = await runGraphQLQuery(CREATE_WORKFLOW, scrapingWorkflowInput, token);
  if (!createResult) {
    console.log('❌ Failed to create scraping workflow');
    return;
  }
  console.log('✅ Successfully created scraping workflow');

  // Execute workflow
  const executeResult = await runGraphQLQuery(EXECUTE_WORKFLOW, {
    workflowId: createResult.createWorkflow.id
  }, token);

  if (!executeResult) {
    console.log('❌ Failed to execute scraping workflow');
    return;
  }

  if (executeResult.executeWorkflow.success) {
    console.log('✅ Successfully executed scraping workflow');
    console.log('Results:', executeResult.executeWorkflow.results);
  } else {
    console.log('❌ Workflow execution failed:', executeResult.executeWorkflow.message);
  }

  // Test 2: Execute Multi-Node Workflow
  console.log('\n2. Testing multi-node workflow...');
  const multiNodeWorkflowInput = {
    input: {
      name: 'Test Multi-Node Workflow',
      description: 'A workflow with multiple connected nodes',
      nodes: [
        {
          id: '1',
          type: 'SCRAPING',
          label: 'Web Scraping',
          position: { x: 0, y: 0 },
          data: {
            url: 'https://example.com',
            selector: 'h1',
            selectorType: 'css',
            attributes: ['text'],
            template: '{text}'
          }
        },
        {
          id: '2',
          type: 'openaiCompletion',
          label: 'AI Analysis',
          position: { x: 300, y: 0 },
          data: {
            prompt: 'Analyze this text: {input}',
            model: 'gpt-3.5-turbo',
            maxTokens: 100
          }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2'
        }
      ]
    }
  };

  // Create multi-node workflow
  const createMultiResult = await runGraphQLQuery(CREATE_WORKFLOW, multiNodeWorkflowInput, token);
  if (!createMultiResult) {
    console.log('❌ Failed to create multi-node workflow');
    return;
  }
  console.log('✅ Successfully created multi-node workflow');

  // Execute multi-node workflow
  const executeMultiResult = await runGraphQLQuery(EXECUTE_WORKFLOW, {
    workflowId: createMultiResult.createWorkflow.id
  }, token);

  if (!executeMultiResult) {
    console.log('❌ Failed to execute multi-node workflow');
    return;
  }

  if (executeMultiResult.executeWorkflow.success) {
    console.log('✅ Successfully executed multi-node workflow');
    console.log('Results:', executeMultiResult.executeWorkflow.results);
  } else {
    console.log('❌ Multi-node workflow execution failed:', executeMultiResult.executeWorkflow.message);
  }

  // Test 3: Execute Invalid Workflow (Missing Required Data)
  console.log('\n3. Testing invalid workflow execution...');
  const invalidWorkflowInput = {
    input: {
      name: 'Test Invalid Workflow',
      description: 'A workflow with invalid node configuration',
      nodes: [{
        id: '1',
        type: 'SCRAPING',
        label: 'Invalid Scraping',
        position: { x: 0, y: 0 },
        data: {
          // Missing required url and selector
        }
      }],
      edges: []
    }
  };

  // Create invalid workflow
  const createInvalidResult = await runGraphQLQuery(CREATE_WORKFLOW, invalidWorkflowInput, token);
  if (!createInvalidResult) {
    console.log('❌ Failed to create invalid workflow');
    return;
  }
  console.log('✅ Successfully created invalid workflow');

  // Execute invalid workflow
  const executeInvalidResult = await runGraphQLQuery(EXECUTE_WORKFLOW, {
    workflowId: createInvalidResult.createWorkflow.id
  }, token);

  if (!executeInvalidResult) {
    console.log('❌ Failed to execute invalid workflow');
    return;
  }

  if (!executeInvalidResult.executeWorkflow.success) {
    console.log('✅ Successfully caught invalid workflow execution');
    console.log('Error message:', executeInvalidResult.executeWorkflow.message);
  } else {
    console.log('❌ Invalid workflow execution unexpectedly succeeded');
  }
}

// Run the tests
testWorkflowExecution().catch(console.error); 
