-- Clear all data from BlueMe database tables
-- WARNING: This will delete ALL data from these tables

-- Clear playlist items first (due to foreign key constraints)
DELETE FROM playlist_items;

-- Clear playlists
DELETE FROM playlists;

-- Clear audio files
DELETE FROM audio_files;

-- Clear audio conversions
DELETE FROM audio_conversions;

-- Clear bluetooth devices
DELETE FROM bluetooth_devices;

-- Clear sync participants
DELETE FROM sync_participants;

-- Clear sync sessions
DELETE FROM sync_sessions;

-- Clear users (this will also clear any related data due to CASCADE)
DELETE FROM users;

-- Reset auto-increment sequences (if any)
-- Note: UUIDs don't need sequence resets, but included for completeness

-- Verify tables are empty
SELECT 'playlist_items' as table_name, COUNT(*) as row_count FROM playlist_items
UNION ALL
SELECT 'playlists', COUNT(*) FROM playlists
UNION ALL
SELECT 'audio_files', COUNT(*) FROM audio_files
UNION ALL
SELECT 'audio_conversions', COUNT(*) FROM audio_conversions
UNION ALL
SELECT 'bluetooth_devices', COUNT(*) FROM bluetooth_devices
UNION ALL
SELECT 'sync_participants', COUNT(*) FROM sync_participants
UNION ALL
SELECT 'sync_sessions', COUNT(*) FROM sync_sessions
UNION ALL
SELECT 'users', COUNT(*) FROM users;
