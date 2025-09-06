-- 🗑️ COMPLETE DATABASE CLEAR SCRIPT
-- WARNING: This will delete ALL data from ALL tables
-- Run this in your Supabase SQL Editor before setting up the new schema

-- Disable Row Level Security temporarily for clearing
ALTER TABLE IF EXISTS playlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audio_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audio_conversions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bluetooth_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sync_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sync_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Clear data in correct order (respecting foreign key constraints)
-- 1. Clear dependent tables first
DELETE FROM playlist_items;
DELETE FROM sync_participants;
DELETE FROM audio_conversions;

-- 2. Clear main tables
DELETE FROM playlists;
DELETE FROM audio_files;
DELETE FROM bluetooth_devices;
DELETE FROM sync_sessions;
DELETE FROM users;

-- 3. Clear any other tables that might exist (only if they exist)
-- Note: We can't use DELETE FROM IF EXISTS, so we'll use conditional deletion
DO $$
BEGIN
    -- Only delete if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        DELETE FROM user_sessions;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        DELETE FROM user_preferences;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversion_logs') THEN
        DELETE FROM conversion_logs;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_uploads') THEN
        DELETE FROM file_uploads;
    END IF;
END $$;

-- Reset any sequences (if using serial/auto-increment)
-- Note: UUIDs don't need sequence resets, but included for completeness
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS audio_files_id_seq RESTART WITH 1;

-- Re-enable Row Level Security
ALTER TABLE IF EXISTS playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audio_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bluetooth_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sync_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- Verify all tables are empty
SELECT 
    'playlist_items' as table_name, 
    COUNT(*) as row_count 
FROM playlist_items
UNION ALL
SELECT 'playlists', COUNT(*) FROM playlists
UNION ALL
SELECT 'audio_files', COUNT(*) FROM audio_files
UNION ALL
SELECT 'audio_conversions', COUNT(*) FROM audio_conversions
UNION ALL
SELECT 'bluetooth_devices', COUNT(*) FROM bluetooth_devices
UNION ALL
SELECT 'sync_sessions', COUNT(*) FROM sync_sessions
UNION ALL
SELECT 'sync_participants', COUNT(*) FROM sync_participants
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;

-- Show success message
SELECT '✅ Database cleared successfully! All tables are now empty.' as status;
