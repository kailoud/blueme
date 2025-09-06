-- TEMPORARY FIX: Disable RLS on audio_files table
-- This allows guest users to insert/update/delete without policy restrictions
-- Use this if the policy updates are causing issues

-- Disable RLS on audio_files table
ALTER TABLE audio_files DISABLE ROW LEVEL SECURITY;

-- Disable RLS on audio_conversions table  
ALTER TABLE audio_conversions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bluetooth_devices table
ALTER TABLE bluetooth_devices DISABLE ROW LEVEL SECURITY;

-- Disable RLS on sync_sessions table
ALTER TABLE sync_sessions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on sync_participants table
ALTER TABLE sync_participants DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('audio_files', 'audio_conversions', 'bluetooth_devices', 'sync_sessions', 'sync_participants')
ORDER BY tablename;
