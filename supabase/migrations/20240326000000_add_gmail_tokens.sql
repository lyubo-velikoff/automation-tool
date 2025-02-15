-- Add gmail_tokens column to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS gmail_tokens JSONB;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.gmail_tokens IS 'Gmail OAuth tokens for the user'; 