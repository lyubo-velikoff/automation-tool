import 'dotenv/config';
import fetch from 'node-fetch';
import { supabase } from '../lib/supabase';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

// GraphQL Queries/Mutations
const CREATE_TAG = `
mutation CreateWorkflowTag($input: CreateWorkflowTagInput!) {
  createWorkflowTag(input: $input) {
    id
    name
    color
    created_at
    updated_at
  }
}`;

const GET_TAGS = `
query GetWorkflowTags {
  workflowTags {
    id
    name
    color
    created_at
    updated_at
  }
}`;

const DELETE_TAG = `
mutation DeleteWorkflowTag($id: ID!) {
  deleteWorkflowTag(id: $id)
}`;

const CREATE_WORKFLOW = `
mutation CreateWorkflow($input: CreateWorkflowInput!) {
  createWorkflow(input: $input) {
    id
    name
    tags {
      id
      name
      color
    }
  }
}`;

const UPDATE_WORKFLOW = `
mutation UpdateWorkflow($input: UpdateWorkflowInput!) {
  updateWorkflow(input: $input) {
    id
    name
    tags {
      id
      name
      color
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

async function testWorkflowTags() {
  console.log('Starting workflow tags test...');
  
  // Get auth token
  const token = await getTestAuthToken();
  if (!token) {
    console.error('Failed to get auth token');
    return;
  }

  // Test 1: Create Tags
  console.log('\n1. Testing tag creation...');
  const tags = [
    { name: 'Production', color: '#FF0000' },
    { name: 'Development', color: '#00FF00' },
    { name: 'Testing', color: '#0000FF' }
  ];

  const createdTags = [];
  for (const tag of tags) {
    const createResult = await runGraphQLQuery(CREATE_TAG, {
      input: tag
    }, token);

    if (!createResult) {
      console.log(`❌ Failed to create tag: ${tag.name}`);
      return;
    }
    createdTags.push(createResult.createWorkflowTag);
    console.log(`✅ Created tag: ${tag.name}`);
  }

  // Test 2: List Tags
  console.log('\n2. Testing tag listing...');
  const listResult = await runGraphQLQuery(GET_TAGS, {}, token);
  if (!listResult) {
    console.log('❌ Failed to list tags');
    return;
  }
  console.log(`✅ Successfully listed ${listResult.workflowTags.length} tags`);

  // Test 3: Create Workflow with Tags
  console.log('\n3. Testing workflow creation with tags...');
  const workflowInput = {
    input: {
      name: 'Tagged Test Workflow',
      nodes: [{
        id: '1',
        type: 'SCRAPING',
        label: 'Web Scraping',
        position: { x: 0, y: 0 },
        data: {
          url: 'https://example.com',
          selector: 'h1',
          selectorType: 'css',
          attributes: ['text']
        }
      }],
      edges: [],
      tag_ids: createdTags.map(tag => tag.id)
    }
  };

  const createWorkflowResult = await runGraphQLQuery(CREATE_WORKFLOW, workflowInput, token);
  if (!createWorkflowResult) {
    console.log('❌ Failed to create workflow with tags');
    return;
  }
  console.log('✅ Successfully created workflow with tags');

  // Test 4: Update Workflow Tags
  console.log('\n4. Testing workflow tag update...');
  const updateInput = {
    input: {
      id: createWorkflowResult.createWorkflow.id,
      tag_ids: [createdTags[0].id] // Only keep the first tag
    }
  };

  const updateResult = await runGraphQLQuery(UPDATE_WORKFLOW, updateInput, token);
  if (!updateResult) {
    console.log('❌ Failed to update workflow tags');
    return;
  }
  console.log('✅ Successfully updated workflow tags');

  // Test 5: Delete Tags
  console.log('\n5. Testing tag deletion...');
  for (const tag of createdTags) {
    const deleteResult = await runGraphQLQuery(DELETE_TAG, {
      id: tag.id
    }, token);

    if (!deleteResult) {
      console.log(`❌ Failed to delete tag: ${tag.name}`);
      return;
    }
    console.log(`✅ Deleted tag: ${tag.name}`);
  }
}

// Run the tests
testWorkflowTags().catch(console.error); 
