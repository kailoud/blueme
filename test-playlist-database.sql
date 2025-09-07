-- Test playlist database operations
-- Run this to check if playlists and playlist_items can be inserted

-- Check RLS status on playlist tables
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
AND tablename IN ('playlists', 'playlist_items')
ORDER BY tablename;

-- Check current policies on playlists table
SELECT 
    policyname,
    cmd as command,
    permissive,
    roles,
    qual as condition,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'playlists'
ORDER BY policyname;

-- Check current policies on playlist_items table
SELECT 
    policyname,
    cmd as command,
    permissive,
    roles,
    qual as condition,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'playlist_items'
ORDER BY policyname;

-- Test insert permission for playlists (this will be rolled back)
BEGIN;
    INSERT INTO playlists (
        id, 
        name, 
        description, 
        user_id, 
        is_public, 
        is_premium, 
        max_songs, 
        created_at, 
        updated_at
    ) VALUES (
        'test-playlist-12345',
        'Test Playlist',
        'Test Description',
        null,
        false,
        false,
        10,
        NOW(),
        NOW()
    );
    
    -- If we get here, the insert worked
    SELECT 'SUCCESS: Playlist insert test passed' as result;
    
    -- Rollback the test insert
    ROLLBACK;

-- Test insert permission for playlist_items (this will be rolled back)
BEGIN;
    INSERT INTO playlist_items (
        id,
        playlist_id,
        audio_file_id,
        position,
        added_at
    ) VALUES (
        'test-item-12345',
        'test-playlist-12345',
        'test-audio-12345',
        1,
        NOW()
    );
    
    -- If we get here, the insert worked
    SELECT 'SUCCESS: Playlist item insert test passed' as result;
    
    -- Rollback the test insert
    ROLLBACK;
