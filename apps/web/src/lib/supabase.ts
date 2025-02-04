'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a single shared instance with explicit configuration
export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}); 
