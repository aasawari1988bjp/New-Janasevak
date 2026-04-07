-- Add complaint_count field to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS complaint_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_complaint_count ON users(complaint_count);

-- Update existing users to have complaint_count = 0
UPDATE users 
SET complaint_count = 0 
WHERE complaint_count IS NULL;

-- Verify the change
SELECT id, full_name, epic_number, voter_verified, complaint_count 
FROM users 
LIMIT 10;
