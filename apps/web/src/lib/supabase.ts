'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a single shared instance
export const supabase = createClientComponentClient(); 
