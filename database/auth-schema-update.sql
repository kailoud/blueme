-- Authentication Schema Updates for BlueMe
-- Run this in your Supabase SQL Editor to add authentication support

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for email lookups (for faster login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Update RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own account" ON users;

-- Create new RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own account" ON users
    FOR DELETE USING (auth.uid() = id);

-- Allow anonymous users to register (insert new users)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Update playlist RLS policies to work with authentication
-- Drop existing playlist policies
DROP POLICY IF EXISTS "Users can view public playlists" ON playlists;
DROP POLICY IF EXISTS "Users can view their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can insert their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;

-- Create new playlist policies
CREATE POLICY "Users can view public playlists" ON playlists
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own playlists" ON playlists
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own playlists" ON playlists
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own playlists" ON playlists
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own playlists" ON playlists
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Update playlist_items RLS policies
DROP POLICY IF EXISTS "Users can view playlist items" ON playlist_items;
DROP POLICY IF EXISTS "Users can insert playlist items" ON playlist_items;
DROP POLICY IF EXISTS "Users can update playlist items" ON playlist_items;
DROP POLICY IF EXISTS "Users can delete playlist items" ON playlist_items;

CREATE POLICY "Users can view playlist items" ON playlist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_items.playlist_id 
            AND (playlists.is_public = true OR playlists.user_id = auth.uid() OR playlists.user_id IS NULL)
        )
    );

CREATE POLICY "Users can insert playlist items" ON playlist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_items.playlist_id 
            AND (playlists.user_id = auth.uid() OR playlists.user_id IS NULL)
        )
    );

CREATE POLICY "Users can update playlist items" ON playlist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_items.playlist_id 
            AND (playlists.user_id = auth.uid() OR playlists.user_id IS NULL)
        )
    );

CREATE POLICY "Users can delete playlist items" ON playlist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_items.playlist_id 
            AND (playlists.user_id = auth.uid() OR playlists.user_id IS NULL)
        )
    );

-- Create a function to get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'userId'
  )::UUID
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;

-- Comments for documentation
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for user authentication';
COMMENT ON INDEX idx_users_email IS 'Index for fast email lookups during login';
COMMENT ON INDEX idx_users_username IS 'Index for fast username lookups';
