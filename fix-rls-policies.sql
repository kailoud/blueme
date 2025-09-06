-- Fix RLS policies to allow guest users (null user_id) to insert audio files
-- This script updates the policies to work without authentication

-- Drop existing policies for audio_files
DROP POLICY IF EXISTS "Users can view their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can insert their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can update their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON audio_files;

-- Create new policies that allow guest users (null user_id)
CREATE POLICY "Anyone can view audio files" ON audio_files
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert audio files" ON audio_files
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update audio files" ON audio_files
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete audio files" ON audio_files
    FOR DELETE USING (true);

-- Drop existing policies for audio_conversions
DROP POLICY IF EXISTS "Users can view their own conversions" ON audio_conversions;
DROP POLICY IF EXISTS "Users can insert their own conversions" ON audio_conversions;

-- Create new policies for audio_conversions
CREATE POLICY "Anyone can view conversions" ON audio_conversions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert conversions" ON audio_conversions
    FOR INSERT WITH CHECK (true);

-- Drop existing policies for bluetooth_devices
DROP POLICY IF EXISTS "Users can manage their own devices" ON bluetooth_devices;

-- Create new policies for bluetooth_devices
CREATE POLICY "Anyone can manage devices" ON bluetooth_devices
    FOR ALL USING (true);

-- Drop existing policies for sync_sessions
DROP POLICY IF EXISTS "Users can view public sync sessions" ON sync_sessions;
DROP POLICY IF EXISTS "Users can manage their own sync sessions" ON sync_sessions;

-- Create new policies for sync_sessions
CREATE POLICY "Anyone can view sync sessions" ON sync_sessions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage sync sessions" ON sync_sessions
    FOR ALL USING (true);

-- Drop existing policies for sync_participants
DROP POLICY IF EXISTS "Users can view session participants" ON sync_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON sync_participants;
DROP POLICY IF EXISTS "Users can leave sessions" ON sync_participants;

-- Create new policies for sync_participants
CREATE POLICY "Anyone can view participants" ON sync_participants
    FOR SELECT USING (true);

CREATE POLICY "Anyone can join sessions" ON sync_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can leave sessions" ON sync_participants
    FOR DELETE USING (true);

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
