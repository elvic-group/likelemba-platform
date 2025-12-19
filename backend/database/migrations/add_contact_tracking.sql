-- Add contact tracking fields to users table
-- This ensures we only send messages to users who have contacted us first

ALTER TABLE likelemba.users 
ADD COLUMN IF NOT EXISTS has_contacted_us BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_has_contacted ON likelemba.users(has_contacted_us);

-- Update existing users who have last_seen_at set (they've contacted us)
UPDATE likelemba.users 
SET has_contacted_us = TRUE, 
    first_contact_at = COALESCE(first_contact_at, last_seen_at)
WHERE last_seen_at IS NOT NULL;

