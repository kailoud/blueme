-- BlueMe Audio Converter Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    free_playlist_count INTEGER DEFAULT 0,
    premium_playlist_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio files table
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    public_url TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    duration INTEGER, -- in seconds
    artist VARCHAR(255),
    title VARCHAR(255),
    album VARCHAR(255),
    bitrate INTEGER,
    sample_rate INTEGER,
    channels INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio conversions table
CREATE TABLE IF NOT EXISTS audio_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
    converted_file_name VARCHAR(255) NOT NULL,
    converted_file_path TEXT NOT NULL,
    output_format VARCHAR(10) NOT NULL,
    quality INTEGER NOT NULL, -- kbps
    public_url TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversion_time INTEGER, -- in milliseconds
    file_size_before BIGINT,
    file_size_after BIGINT,
    status VARCHAR(20) DEFAULT 'completed', -- pending, processing, completed, failed
    error_message TEXT,
    converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    max_songs INTEGER DEFAULT 2, -- Free users: 2 songs, Premium: 10 songs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist items table
CREATE TABLE IF NOT EXISTS playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bluetooth devices table
CREATE TABLE IF NOT EXISTS bluetooth_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_connected BOOLEAN DEFAULT false,
    last_connected TIMESTAMP WITH TIME ZONE,
    battery_level INTEGER,
    audio_support BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync sessions table
CREATE TABLE IF NOT EXISTS sync_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_name VARCHAR(255),
    host_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_track_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync session participants
CREATE TABLE IF NOT EXISTS sync_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sync_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES bluetooth_devices(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_uploaded_at ON audio_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_audio_conversions_user_id ON audio_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_conversions_original_file_id ON audio_conversions(original_file_id);
CREATE INDEX IF NOT EXISTS idx_bluetooth_devices_user_id ON bluetooth_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_host_user_id ON sync_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_sync_participants_session_id ON sync_participants(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bluetooth_devices_updated_at BEFORE UPDATE ON bluetooth_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_sessions_updated_at BEFORE UPDATE ON sync_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (email, username) VALUES 
    ('demo@blueme.app', 'demo_user')
ON CONFLICT (email) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluetooth_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audio_files
CREATE POLICY "Users can view their own audio files" ON audio_files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio files" ON audio_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio files" ON audio_files
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files" ON audio_files
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audio_conversions
CREATE POLICY "Users can view their own conversions" ON audio_conversions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions" ON audio_conversions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for playlists
CREATE POLICY "Users can view public playlists" ON playlists
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own playlists" ON playlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlists" ON playlists
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for bluetooth_devices
CREATE POLICY "Users can manage their own devices" ON bluetooth_devices
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for sync_sessions
CREATE POLICY "Users can view public sync sessions" ON sync_sessions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own sync sessions" ON sync_sessions
    FOR ALL USING (auth.uid() = host_user_id);

-- RLS Policies for sync_participants
CREATE POLICY "Users can view session participants" ON sync_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join sessions" ON sync_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can leave sessions" ON sync_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE audio_files IS 'Stores metadata for uploaded audio files';
COMMENT ON TABLE audio_conversions IS 'Tracks audio file format conversions';
COMMENT ON TABLE playlists IS 'User-created music playlists';
COMMENT ON TABLE bluetooth_devices IS 'User Bluetooth device information';
COMMENT ON TABLE sync_sessions IS 'Active music synchronization sessions';
COMMENT ON TABLE sync_participants IS 'Users participating in sync sessions';
