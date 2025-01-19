import { google } from 'googleapis';

// Gmail API scopes needed for reading and sending emails
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

// Create OAuth2 client using access token
export const createOAuth2Client = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    access_token: accessToken,
    token_type: 'Bearer'
  });
  return oauth2Client;
};

// Create Gmail API instance with access token
export const createGmailClient = (accessToken: string) => {
  const auth = createOAuth2Client(accessToken);
  return google.gmail({ version: 'v1', auth });
}; 
