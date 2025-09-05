-- Fix database schema to match the application code
-- Run this in your Supabase SQL Editor

-- First, check if the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'playlists' 
AND table_schema = 'public';

-- Add missing columns to playlists table if they don't exist
ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS max_songs INTEGER DEFAULT 2;

-- Add missing columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS free_playlist_count INTEGER DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS premium_playlist_count INTEGER DEFAULT 0;

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'playlists' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
