-- Migration: Add social media links to tokens table
-- Date: 2025-01-XX
-- Description: Add optional Telegram group and X (Twitter) profile links to tokens

ALTER TABLE tokens 
ADD COLUMN telegram_url VARCHAR(500) NULL,
ADD COLUMN x_url VARCHAR(500) NULL;

-- Add comments for documentation
COMMENT ON COLUMN tokens.telegram_url IS 'Optional Telegram group/channel URL for the token';
COMMENT ON COLUMN tokens.x_url IS 'Optional X (Twitter) profile URL for the token';

-- Add indexes for better query performance if needed
CREATE INDEX CONCURRENTLY idx_tokens_telegram_url ON tokens(telegram_url) WHERE telegram_url IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_tokens_x_url ON tokens(x_url) WHERE x_url IS NOT NULL;