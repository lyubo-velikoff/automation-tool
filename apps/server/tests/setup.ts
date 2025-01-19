/// <reference types="jest" />
import 'reflect-metadata';

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:4000/auth/google/callback';

// Silence console.log during tests
global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn(); 
