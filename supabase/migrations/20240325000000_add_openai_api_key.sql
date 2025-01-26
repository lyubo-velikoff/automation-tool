-- Add openai_api_key column to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.openai_api_key IS 'OpenAI API key for the user'; 
