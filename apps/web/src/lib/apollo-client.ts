import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

// Create cache with optimized type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        workflows: {
          merge: (_, incoming) => incoming,
        },
        executions: {
          merge: (_, incoming) => incoming,
        }
      }
    }
  }
});

// Create HTTP link
const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/graphql`,
});

// Optimize auth link to cache session
let cachedSession: Session | null = null;
const authLink = setContext(async (_, { headers }) => {
  try {
    if (!cachedSession) {
      const { data: { session } } = await supabase.auth.getSession();
      cachedSession = session;
    }
    
    const token = cachedSession?.access_token;
    const gmailToken = cachedSession?.provider_token;

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'x-gmail-token': gmailToken || '',
      }
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { headers };
  }
});

// Export optimized client
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
  assumeImmutableResults: true,
  queryDeduplication: true,
}); 
