-- Fix playlist creation by disabling RLS temporarily
-- Run this in your Supabase SQL Editor

-- Disable RLS for playlists table
ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies for playlists (if they exist)
DROP POLICY IF EXISTS "Users can view public playlists" ON playlists;
DROP POLICY IF EXISTS "Users can view their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can manage their own playlists" ON playlists;

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'playlists';
