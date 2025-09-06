-- Test database connection and RLS status
-- Run this to check if RLS is properly configured

-- Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ENABLED - May block guest users'
        WHEN rowsecurity = false THEN 'RLS DISABLED - Guest users allowed'
        ELSE 'Unknown'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('audio_files', 'audio_conversions', 'bluetooth_devices', 'sync_sessions', 'sync_participants')
ORDER BY tablename;

-- Check current policies on audio_files
SELECT 
    policyname,
    cmd as command,
    permissive,
    roles,
    qual as condition,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'audio_files'
ORDER BY policyname;

-- Test insert permission (this should work if RLS is properly configured)
-- This is just a test - it will be rolled back
BEGIN;
    INSERT INTO audio_files (
        id, 
        file_name, 
        original_name, 
        file_path, 
        file_size, 
        mime_type, 
        public_url, 
        user_id, 
        duration, 
        title, 
        artist, 
        album, 
        uploaded_at
    ) VALUES (
        'test-12345-67890-abcdef',
        'test_file.mp3',
        'test_file.mp3',
        'test',
        1024,
        'audio/mpeg',
        'test',
        null,
        120,
        'Test File',
        'Test Artist',
        'Test Album',
        NOW()
    );
    
    -- If we get here, the insert worked
    SELECT 'SUCCESS: Insert test passed - RLS is properly configured' as result;
    
    -- Rollback the test insert
    ROLLBACK;
