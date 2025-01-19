import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Gmail API scopes needed for reading and sending emails
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

// Create OAuth2 client using tokens from Supabase session
export const createOAuth2Client = async (userId: string) => {
  // Get user's Google OAuth tokens from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('google_tokens')
    .eq('id', userId)
    .single();

  if (error || !user?.google_tokens) {
    throw new Error('Google OAuth tokens not found');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(user.google_tokens);
  return oauth2Client;
};

// Create Gmail API instance with user-specific auth
export const createGmailClient = async (userId: string) => {
  const auth = await createOAuth2Client(userId);
  return google.gmail({ version: 'v1', auth });
}; 
