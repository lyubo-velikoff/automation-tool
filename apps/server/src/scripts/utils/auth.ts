import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getTestAuthToken(): Promise<string> {
  // For testing with service key, we can create a session directly
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'test123456',
    email_confirm: true
  });

  if (error) {
    // If user already exists, try to get their session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123456'
    });

    if (signInError) {
      throw new Error(`Failed to authenticate test user: ${signInError.message}`);
    }

    return signInData.session?.access_token || '';
  }

  // Get session for newly created user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'test123456'
  });

  if (signInError) {
    throw new Error(`Failed to sign in after creating user: ${signInError.message}`);
  }

  return signInData.session?.access_token || '';
} 
