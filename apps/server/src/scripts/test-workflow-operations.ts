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
    nodes {
      id
      type
      label
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
  }
}`;

const UPDATE_WORKFLOW = `
mutation UpdateWorkflow($input: UpdateWorkflowInput!) {
  updateWorkflow(input: $input) {
    id
    name
    nodes {
      id
      type
      label
    }
  }
}`;

const GET_WORKFLOW = `
query GetWorkflow($id: ID!) {
  workflow(id: $id) {
    id
    name
    nodes {
      id
      type
      label
    }
    edges {
      id
      source
      target
    }
  }
}`;

const DELETE_WORKFLOW = `
mutation DeleteWorkflow($id: ID!) {
  deleteWorkflow(id: $id)
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

async function testWorkflowOperations() {
  console.log('Starting workflow operations test...');
  
  // Get auth token
  const token = await getTestAuthToken();
  if (!token) {
    console.error('Failed to get auth token');
    return;
  }

  // Test 1: Create Workflow
  console.log('\n1. Testing workflow creation...');
  const createInput = {
    input: {
      name: 'Test Workflow Operations',
      nodes: [{
        id: '1',
        type: 'SCRAPING',
        label: 'Web Scraping Test',
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

  const createResult = await runGraphQLQuery(CREATE_WORKFLOW, createInput, token);
  if (!createResult) {
    console.log('❌ Failed to create workflow');
    return;
  }

  const workflowId = createResult.createWorkflow.id;
  console.log('✅ Workflow created with ID:', workflowId);

  // Test 2: Get Workflow
  console.log('\n2. Testing workflow retrieval...');
  const getResult = await runGraphQLQuery(GET_WORKFLOW, { id: workflowId }, token);
  if (!getResult) {
    console.log('❌ Failed to get workflow');
    return;
  }
  console.log('✅ Successfully retrieved workflow');

  // Test 3: Update Workflow
  console.log('\n3. Testing workflow update...');
  const updateInput = {
    input: {
      id: workflowId,
      name: 'Updated Test Workflow',
      nodes: [{
        id: '1',
        type: 'SCRAPING',
        label: 'Updated Web Scraping',
        position: { x: 100, y: 100 },
        data: {
          url: 'https://example.com',
          selector: 'h1',
          selectorType: 'css',
          attributes: ['text', 'href'],
          template: '[{text}]({href})'
        }
      }],
      edges: []
    }
  };

  const updateResult = await runGraphQLQuery(UPDATE_WORKFLOW, updateInput, token);
  if (!updateResult) {
    console.log('❌ Failed to update workflow');
    return;
  }
  console.log('✅ Successfully updated workflow');

  // Test 4: Delete Workflow
  console.log('\n4. Testing workflow deletion...');
  const deleteResult = await runGraphQLQuery(DELETE_WORKFLOW, { id: workflowId }, token);
  if (!deleteResult) {
    console.log('❌ Failed to delete workflow');
    return;
  }
  console.log('✅ Successfully deleted workflow');
}

// Run the tests
testWorkflowOperations().catch(console.error); 
