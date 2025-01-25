import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { supabase } from './supabase';

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

// Create auth link with session management
const authLink = setContext(async (_, { headers }) => {
  try {
    // Always get fresh session to ensure we have the latest state
    const { data: { session } } = await supabase.auth.getSession();
    
    const token = session?.access_token;
    const gmailToken = session?.provider_token;

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

// Create client instance
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'network-only', // Always fetch fresh data after auth changes
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
  assumeImmutableResults: true,
  queryDeduplication: true,
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    // Reset Apollo cache when auth state changes
    client.resetStore().catch(console.error);
  }
}); 
