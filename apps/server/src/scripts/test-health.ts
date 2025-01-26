import 'reflect-metadata';
import { getTestAuthToken } from './utils/auth';

interface HealthResponse {
  data?: {
    health: string;
  };
  errors?: Array<{
    message: string;
  }>;
}

async function testHealth() {
  console.log('Starting health check test...');
  
  const token = await getTestAuthToken();
  
  const query = `
    query Health {
      health
    }
  `;
  
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: {}
      })
    });

    const result = await response.json() as HealthResponse;
    console.log('Health check response:', result);

    if (result.errors) {
      console.log('❌ Health check failed with errors:', result.errors);
      process.exit(1);
    }

    if (result.data?.health === 'OK') {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed - unexpected response:', result.data?.health);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during health check:', error);
    process.exit(1);
  }
}

testHealth().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 
