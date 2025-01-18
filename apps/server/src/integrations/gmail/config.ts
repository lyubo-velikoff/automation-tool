import { google } from 'googleapis';

// Gmail API scopes needed for reading and sending emails
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

// OAuth2 configuration
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Gmail API instance
export const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Helper to generate OAuth URL
export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent',
  });
};

// Helper to get tokens from code
export const getTokensFromCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Set credentials for authenticated requests
export const setCredentials = (tokens: any) => {
  oauth2Client.setCredentials(tokens);
}; 
