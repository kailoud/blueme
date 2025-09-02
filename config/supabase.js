const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found. Audio converter will use local storage.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database tables structure
const TABLES = {
    AUDIO_FILES: 'audio_files',
    CONVERSIONS: 'audio_conversions',
    USERS: 'users',
    PLAYLISTS: 'playlists'
};

// Audio file storage bucket
const STORAGE_BUCKETS = {
    AUDIO: 'audio-files',
    CONVERTED: 'converted-audio',
    TEMP: 'temp-files'
};

// Initialize storage buckets if they don't exist
async function initializeStorage() {
    try {
        if (!supabaseUrl || !supabaseKey) return;
        
        // Check if buckets exist, create if they don't
        const { data: buckets } = await supabase.storage.listBuckets();
        const existingBuckets = buckets.map(bucket => bucket.name);
        
        for (const bucketName of Object.values(STORAGE_BUCKETS)) {
            if (!existingBuckets.includes(bucketName)) {
                await supabase.storage.createBucket(bucketName, {
                    public: false,
                    allowedMimeTypes: ['audio/*'],
                    fileSizeLimit: 52428800 // 50MB
                });
                console.log(`✅ Created storage bucket: ${bucketName}`);
            }
        }
    } catch (error) {
        console.error('❌ Error initializing storage:', error.message);
    }
}

// Audio file management functions
const audioManager = {
    // Upload audio file to Supabase storage
    async uploadFile(file, metadata = {}) {
        try {
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase not configured');
            }

            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = `${metadata.userId || 'anonymous'}/${fileName}`;
            
            // Upload to storage
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKETS.AUDIO)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    metadata: {
                        originalName: file.originalname,
                        size: file.size,
                        ...metadata
                    }
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKETS.AUDIO)
                .getPublicUrl(filePath);

            // Save metadata to database
            const { data: dbData, error: dbError } = await supabase
                .from(TABLES.AUDIO_FILES)
                .insert({
                    file_name: fileName,
                    original_name: file.originalname,
                    file_path: filePath,
                    file_size: file.size,
                    mime_type: file.mimetype,
                    public_url: urlData.publicUrl,
                    user_id: metadata.userId || null,
                    duration: metadata.duration || null,
                    artist: metadata.artist || null,
                    title: metadata.title || null,
                    album: metadata.album || null,
                    uploaded_at: new Date().toISOString()
                })
                .select()
                .single();

            if (dbError) throw dbError;

            return {
                success: true,
                file: {
                    id: dbData.id,
                    fileName: fileName,
                    originalName: file.originalname,
                    size: file.size,
                    url: urlData.publicUrl,
                    duration: metadata.duration,
                    artist: metadata.artist,
                    title: metadata.title,
                    album: metadata.album
                }
            };

        } catch (error) {
            console.error('❌ File upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Convert and store audio file
    async convertAndStore(inputFile, outputFormat, quality, metadata = {}) {
        try {
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase not configured');
            }

            // Generate output filename
            const outputFileName = `${Date.now()}-converted.${outputFormat}`;
            const outputPath = `${metadata.userId || 'anonymous'}/converted/${outputFileName}`;

            // For now, we'll simulate conversion
            // In real implementation, use fluent-ffmpeg to convert
            const convertedFile = {
                buffer: inputFile.buffer, // Placeholder - replace with actual conversion
                mimetype: `audio/${outputFormat}`,
                size: inputFile.size * 0.8 // Simulate size change
            };

            // Upload converted file
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKETS.CONVERTED)
                .upload(outputPath, convertedFile.buffer, {
                    contentType: convertedFile.mimetype,
                    metadata: {
                        originalFile: inputFile.originalname,
                        format: outputFormat,
                        quality: quality,
                        ...metadata
                    }
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKETS.CONVERTED)
                .getPublicUrl(outputPath);

            // Save conversion record
            const { data: dbData, error: dbError } = await supabase
                .from(TABLES.CONVERSIONS)
                .insert({
                    original_file_id: metadata.originalFileId,
                    converted_file_name: outputFileName,
                    converted_file_path: outputPath,
                    output_format: outputFormat,
                    quality: quality,
                    public_url: urlData.publicUrl,
                    user_id: metadata.userId || null,
                    converted_at: new Date().toISOString()
                })
                .select()
                .single();

            if (dbError) throw dbError;

            return {
                success: true,
                conversion: {
                    id: dbData.id,
                    fileName: outputFileName,
                    format: outputFormat,
                    quality: quality,
                    url: urlData.publicUrl,
                    size: convertedFile.size
                }
            };

        } catch (error) {
            console.error('❌ Conversion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get user's audio files
    async getUserFiles(userId) {
        try {
            if (!supabaseUrl || !supabaseKey) {
                return { success: false, error: 'Supabase not configured' };
            }

            const { data, error } = await supabase
                .from(TABLES.AUDIO_FILES)
                .select('*')
                .eq('user_id', userId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                files: data || []
            };

        } catch (error) {
            console.error('❌ Error fetching user files:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Delete audio file
    async deleteFile(fileId, userId) {
        try {
            if (!supabaseUrl || !supabaseKey) {
                return { success: false, error: 'Supabase not configured' };
            }

            // Get file info first
            const { data: file, error: fetchError } = await supabase
                .from(TABLES.AUDIO_FILES)
                .select('*')
                .eq('id', fileId)
                .eq('user_id', userId)
                .single();

            if (fetchError || !file) {
                return { success: false, error: 'File not found or access denied' };
            }

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKETS.AUDIO)
                .remove([file.file_path]);

            if (storageError) {
                console.warn('⚠️  Could not delete from storage:', storageError.message);
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from(TABLES.AUDIO_FILES)
                .delete()
                .eq('id', fileId)
                .eq('user_id', userId);

            if (dbError) throw dbError;

            return {
                success: true,
                message: 'File deleted successfully'
            };

        } catch (error) {
            console.error('❌ Error deleting file:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = {
    supabase,
    TABLES,
    STORAGE_BUCKETS,
    initializeStorage,
    audioManager
};
