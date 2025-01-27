import 'dotenv/config';
import fetch from 'node-fetch';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
        urls
        selectors {
          selector
          selectorType
          attributes
          name
          description
        }
        template
        batchConfig {
          batchSize
          rateLimit
        }
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

async function testForumScraperWorkflow() {
  console.log('Starting Forum Scraper Workflow test...');

  // Get auth token
  const token = await getTestAuthToken();
  if (!token) {
    console.error('Failed to get auth token');
    return false;
  }

  // Create workflow input
  const workflowInput = {
    input: {
      name: 'Forum Content Scraper',
      description: 'Scrapes forum topics and their content using two connected nodes',
      nodes: [
        {
          id: 'node1',
          type: 'SCRAPING',
          label: 'Forum Topics Scraper',
          data: {
            url: 'https://forum.cursor.com/',
            selectors: [{
              selector: 'td a.raw-topic-link',
              selectorType: 'css',
              attributes: ['text', 'href'],
              name: 'Topic Links',
              description: 'Extracts forum topic links'
            }],
            template: '{{href}}'
          },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node2',
          type: 'MULTI_URL_SCRAPING',
          label: 'Forum Posts Content Scraper',
          position: { x: 300, y: 100 },
          data: {
            selectors: [
              {
                selector: '#topic-title h1 a',
                selectorType: 'css',
                attributes: ['text'],
                name: 'Post Title',
                description: 'Extracts the forum post title'
              },
              {
                selector: '.post[itemprop="text"]',
                selectorType: 'css',
                attributes: ['text'],
                name: 'Post Content',
                description: 'Extracts the main post content'
              }
            ],
            template: '# {{Post Title}}\n\n{{Post Content}}',
            batchConfig: {
              batchSize: 20,
              rateLimit: 30
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2'
        }
      ]
    }
  };

  // Create workflow
  console.log('\nCreating forum scraper workflow...');
  const createResult = await runGraphQLQuery(CREATE_WORKFLOW, workflowInput, token);
  if (!createResult) {
    console.log('❌ Failed to create forum scraper workflow');
    return false;
  }
  console.log('✅ Successfully created forum scraper workflow');

  // Execute workflow
  console.log('\nExecuting forum scraper workflow...');
  const executeResult = await runGraphQLQuery(EXECUTE_WORKFLOW, {
    workflowId: createResult.createWorkflow.id
  }, token);

  if (!executeResult) {
    console.log('❌ Failed to execute forum scraper workflow');
    return false;
  }

  if (executeResult.executeWorkflow.success) {
    console.log('✅ Successfully executed forum scraper workflow');
    console.log('Results:', executeResult.executeWorkflow.results);
    return true;
  } else {
    console.log('❌ Workflow execution failed:', executeResult.executeWorkflow.message);
    return false;
  }
}

// Run the test
testForumScraperWorkflow().then((success) => {
  console.log('\nTest suite completed');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
}); 
