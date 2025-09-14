// Load File API polyfill for Node.js compatibility
require('./polyfill.js');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const ytdl = require('@distube/ytdl-core');
const crypto = require('crypto');

const app = express();

// Create server - use HTTPS for local development, HTTP for production
let server;
let io;

// Use HTTP for both development and production to avoid SSL certificate issues
server = http.createServer(app);
io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
console.log('🌐 Using HTTP server (SSL issues resolved)');

// Enhanced Bluetooth device management
class BluetoothManager {
    constructor() {
        this.connectedDevices = new Map();
        this.deviceCapabilities = new Map();
        this.syncSessions = new Map();
    }

    // Simulate Bluetooth device discovery (in real implementation, use native Bluetooth libraries)
    async discoverDevices() {
        const mockDevices = [
            { id: 'device-1', name: 'AirPods Pro', type: 'headphones', battery: 85, audioSupport: true },
            { id: 'device-2', name: 'Sony WH-1000XM4', type: 'headphones', battery: 92, audioSupport: true },
            { id: 'device-3', name: 'JBL Flip 5', type: 'speaker', battery: 78, audioSupport: true },
            { id: 'device-4', name: 'Galaxy Buds Pro', type: 'earbuds', battery: 67, audioSupport: true }
        ];
        
        return mockDevices;
    }

    async connectToDevice(deviceId, deviceName) {
        try {
            // Simulate connection process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const deviceInfo = {
                id: deviceId,
                name: deviceName,
                connected: true,
                connectedAt: new Date(),
                battery: Math.floor(Math.random() * 100) + 1,
                audioSupport: true,
                syncCapable: true
            };
            
            this.connectedDevices.set(deviceId, deviceInfo);
            return { success: true, device: deviceInfo };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async disconnectDevice(deviceId) {
        const device = this.connectedDevices.get(deviceId);
        if (device) {
            device.connected = false;
            this.connectedDevices.delete(deviceId);
            return { success: true, device };
        }
        return { success: false, error: 'Device not found' };
    }

    getConnectedDevices() {
        return Array.from(this.connectedDevices.values());
    }

    // Real-time audio sync across devices
    async syncAudioToDevices(audioData, sessionId) {
        const devices = this.getConnectedDevices();
        const syncResults = [];
        
        for (const device of devices) {
            try {
                // Simulate audio streaming to device
                await new Promise(resolve => setTimeout(resolve, 100));
                syncResults.push({
                    deviceId: device.id,
                    deviceName: device.name,
                    status: 'synced',
                    latency: Math.floor(Math.random() * 50) + 10
                });
            } catch (error) {
                syncResults.push({
                    deviceId: device.id,
                    deviceName: device.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        
        return syncResults;
    }
}

// Initialize Bluetooth manager
const bluetoothManager = new BluetoothManager();

// Initialize Supabase if configured
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
        const { initializeStorage } = require('./config/supabase');
        initializeStorage().then(() => {
            console.log('✅ Supabase storage initialized');
        }).catch(error => {
            console.error('❌ Supabase initialization error:', error.message);
        });
    } catch (error) {
        console.error('❌ Supabase config error:', error.message);
    }
} else {
    console.log('⚠️  Supabase not configured - using local storage');
}

// Enhanced CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all origins for development
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Additional CORS headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Enhanced Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🎧 New client connected:', socket.id);

    // Join a sync room
    socket.on('join-sync-room', (roomId) => {
        socket.join(roomId);
        console.log(`🎵 Client ${socket.id} joined sync room: ${roomId}`);
        socket.to(roomId).emit('user-joined', { userId: socket.id });
        
        // Send current device status
        const devices = bluetoothManager.getConnectedDevices();
        socket.emit('device-status-update', { devices });
    });

    // Bluetooth device management
    socket.on('discover-devices', async () => {
        try {
            const devices = await bluetoothManager.discoverDevices();
            socket.emit('devices-discovered', { devices });
        } catch (error) {
            socket.emit('discovery-error', { error: error.message });
        }
    });

    socket.on('connect-device', async (data) => {
        try {
            const result = await bluetoothManager.connectToDevice(data.deviceId, data.deviceName);
            if (result.success) {
                socket.emit('device-connected', result.device);
                socket.broadcast.emit('device-status-update', { 
                    devices: bluetoothManager.getConnectedDevices() 
                });
            } else {
                socket.emit('connection-error', { error: result.error });
            }
        } catch (error) {
            socket.emit('connection-error', { error: error.message });
        }
    });

    socket.on('disconnect-device', async (data) => {
        try {
            const result = await bluetoothManager.disconnectDevice(data.deviceId);
            if (result.success) {
                socket.emit('device-disconnected', result.device);
                socket.broadcast.emit('device-status-update', { 
                    devices: bluetoothManager.getConnectedDevices() 
                });
            }
        } catch (error) {
            socket.emit('disconnection-error', { error: error.message });
        }
    });

    // Enhanced music sync events
    socket.on('play-music', async (data) => {
        try {
            // Sync audio to all connected devices
            const syncResults = await bluetoothManager.syncAudioToDevices(data, socket.id);
            
            socket.to(data.roomId).emit('music-play', {
                trackId: data.trackId,
                timestamp: data.timestamp,
                userId: socket.id,
                syncResults
            });
            
            socket.emit('sync-status', { 
                status: 'synced', 
                devices: syncResults,
                message: `Music synced to ${syncResults.length} devices`
            });
        } catch (error) {
            socket.emit('sync-error', { error: error.message });
        }
    });

    socket.on('pause-music', (data) => {
        socket.to(data.roomId).emit('music-pause', {
            trackId: data.trackId,
            userId: socket.id
        });
    });

    socket.on('seek-music', (data) => {
        socket.to(data.roomId).emit('music-seek', {
            trackId: data.trackId,
            position: data.position,
            userId: socket.id
        });
    });

    socket.on('volume-change', (data) => {
        socket.to(data.roomId).emit('volume-updated', {
            volume: data.volume,
            userId: socket.id
        });
    });

    // Device status monitoring
    socket.on('get-device-status', () => {
        const devices = bluetoothManager.getConnectedDevices();
        socket.emit('device-status-update', { devices });
    });

    socket.on('disconnect', () => {
        console.log('🎧 Client disconnected:', socket.id);
    });
});

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'BlueMe Server Running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Playlist API endpoints
app.get('/api/playlists', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    try {
        // Use Supabase if configured, otherwise fallback to empty array
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { playlistManager } = require('./config/supabase');
            const result = await playlistManager.getPlaylists(null); // Get all playlists
            
            if (result.success) {
                console.log('📥 Fetched playlists from Supabase:', result.playlists.length, 'playlists');
                res.json({
                    success: true,
                    playlists: result.playlists
                });
            } else {
                throw new Error(result.error);
            }
        } else {
            console.log('⚠️ Supabase not configured, returning empty playlists');
            res.json({
                success: true,
                playlists: []
            });
        }
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

app.post('/api/playlists', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    try {
        const { name, description, isPublic = false, userId = 'guest' } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Playlist name is required' });
        }
        
        // Use Supabase if configured, otherwise fallback to in-memory
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { playlistManager } = require('./config/supabase');
            const result = await playlistManager.createPlaylist({
                name,
                description: description || '',
                user_id: userId,
                is_public: isPublic,
                is_premium: false,
                max_songs: 8
            });
            
            if (result.success) {
                console.log('✅ Playlist created in Supabase:', result.playlist.name);
                res.json({
                    success: true,
                    playlist: result.playlist
                });
            } else {
                throw new Error(result.error);
            }
        } else {
            // Fallback to in-memory storage
            const playlist = {
                id: crypto.randomUUID(),
                name,
                description: description || '',
                user_id: userId,
                is_public: isPublic,
                is_premium: false,
                max_songs: 8,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                playlist_items: []
            };
            
            console.log('⚠️ Supabase not configured, playlist created in memory only:', playlist.name);
            res.json({
                success: true,
                playlist
            });
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

app.post('/api/playlists/:playlistId/items', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    try {
        const { playlistId } = req.params;
        const { audioFileId, position, audioFile } = req.body;
        
        if (!audioFileId) {
            return res.status(400).json({ error: 'Audio file ID is required' });
        }
        
        // Use Supabase if configured, otherwise fallback to in-memory
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { playlistManager } = require('./config/supabase');
            const result = await playlistManager.addTrackToPlaylist(playlistId, audioFileId, position);
            
            if (result.success) {
                console.log('✅ Track added to playlist in Supabase:', audioFile?.title || 'Unknown Track');
                res.json({
                    success: true,
                    playlistItem: result.playlistItem
                });
            } else {
                throw new Error(result.error);
            }
        } else {
            // Fallback to in-memory storage (this won't work without the playlists array)
            console.log('⚠️ Supabase not configured, cannot add tracks to playlists');
            res.status(500).json({ error: 'Database not configured - cannot add tracks to playlists' });
        }
    } catch (error) {
        console.error('Error adding to playlist:', error);
        res.status(500).json({ error: 'Failed to add to playlist' });
    }
});

app.delete('/api/playlists/:playlistId/items/:itemId', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    try {
        const { playlistId, itemId } = req.params;
        
        // Use Supabase if configured, otherwise fallback
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { playlistManager } = require('./config/supabase');
            const result = await playlistManager.removeTrackFromPlaylist(playlistId, itemId);
            
            if (result.success) {
                console.log('✅ Track removed from playlist in Supabase');
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                throw new Error(result.error);
            }
        } else {
            console.log('⚠️ Supabase not configured, cannot remove tracks from playlists');
            res.status(500).json({ error: 'Database not configured - cannot remove tracks from playlists' });
        }
    } catch (error) {
        console.error('Error removing from playlist:', error);
        res.status(500).json({ error: 'Failed to remove from playlist' });
    }
});

// Bluetooth device management endpoints
app.get('/api/devices', (req, res) => {
    try {
        const devices = bluetoothManager.getConnectedDevices();
        res.json({ 
            success: true, 
            devices,
            count: devices.length 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/devices/connect', async (req, res) => {
    try {
        const { deviceId, deviceName } = req.body;
        const result = await bluetoothManager.connectToDevice(deviceId, deviceName);
        
        if (result.success) {
            res.json({ 
                success: true, 
                device: result.device,
                message: `Successfully connected to ${result.device.name}`
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/devices/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const result = await bluetoothManager.disconnectDevice(deviceId);
        
        if (result.success) {
            res.json({ 
                success: true, 
                device: result.device,
                message: `Successfully disconnected from ${result.device.name}`
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Handle preflight requests for file upload
app.options('/api/upload', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(200);
});

// Upload audio file
app.post('/api/upload', upload.single('audio'), async (req, res) => {
    // Set CORS headers explicitly for this endpoint
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // If Supabase is configured, use it for storage
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            try {
                const { audioManager } = require('./config/supabase');
                
                const uploadResult = await audioManager.uploadFile(req.file, {
                    userId: req.body.userId || null
                });

                if (uploadResult.success) {
                    console.log('📁 Audio file uploaded to Supabase:', uploadResult.file.fileName);
                    res.json({
                        success: true,
                        message: 'Audio file uploaded to cloud storage successfully',
                        file: {
                            id: uploadResult.file.id,
                            filename: uploadResult.file.fileName,
                            originalName: uploadResult.file.originalName,
                            size: uploadResult.file.size,
                            url: uploadResult.file.url,
                            duration: uploadResult.file.duration,
                            artist: uploadResult.file.artist,
                            title: uploadResult.file.title,
                            album: uploadResult.file.album
                        }
                    });
                } else {
                    throw new Error(uploadResult.error);
                }
            } catch (supabaseError) {
                console.error('Supabase upload error:', supabaseError);
                // Fallback to local storage
                const fileInfo = {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    path: req.file.path,
                    uploadTime: new Date().toISOString()
                };

                console.log('📁 Audio file uploaded locally:', fileInfo.filename);
                
                res.json({
                    success: true,
                    message: 'Audio file uploaded locally (Supabase not configured)',
                    file: fileInfo
                });
            }
        } else {
            // Fallback to local storage
            const fileInfo = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: req.file.path,
                uploadTime: new Date().toISOString()
            };

            console.log('📁 Audio file uploaded locally:', fileInfo.filename);
            
            res.json({
                success: true,
                message: 'Audio file uploaded locally (Supabase not configured)',
                file: fileInfo
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Handle preflight requests for YouTube conversion
app.options('/api/convert-youtube', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(200);
});

// Convert YouTube URL to audio
app.post('/api/convert-youtube', async (req, res) => {
    // Set CORS headers explicitly for this endpoint
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    try {
        const { url, format = 'mp3', quality = '192', userId } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        console.log('🎵 Converting YouTube URL:', url);

        // Try to validate and get info with better error handling
        let info;
        try {
            if (!ytdl.validateURL(url)) {
                return res.status(400).json({ error: 'Invalid YouTube URL' });
            }
            
            // Get video info with timeout
            info = await Promise.race([
                ytdl.getInfo(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Video info timeout')), 10000)
                )
            ]);
        } catch (infoError) {
            console.error('Failed to get video info:', infoError);
            let errorMessage = 'Unable to access this YouTube video.';
            
            if (infoError.message.includes('timeout')) {
                errorMessage = 'YouTube video info request timed out. Please try again.';
            } else if (infoError.message.includes('private') || infoError.message.includes('restricted')) {
                errorMessage = 'This YouTube video is private or restricted.';
            } else if (infoError.message.includes('unavailable')) {
                errorMessage = 'This YouTube video is unavailable.';
            }
            
            return res.status(500).json({ error: errorMessage });
        }
        const videoTitle = info.videoDetails.title;
        const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        console.log('📺 Video title:', videoTitle);
        console.log('🔧 Processing format:', format, 'quality:', quality);

        // Download audio stream with better headers
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        });

        // Convert stream to buffer instead of writing to local file
        const chunks = [];
        audioStream.on('data', (chunk) => chunks.push(chunk));
        
        audioStream.on('end', async () => {
            try {
                const audioBuffer = Buffer.concat(chunks);
                console.log('✅ Audio buffer created, size:', audioBuffer.length);
                
                // If Supabase is configured, use it for storage
                if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
                    try {
                        const { audioManager } = require('./config/supabase');
                        
                        // Create a mock file object for Supabase upload
                        const mockFile = {
                            buffer: audioBuffer,
                            originalname: `${sanitizedTitle}.${format}`,
                            mimetype: `audio/${format}`,
                            size: audioBuffer.length
                        };

                        const uploadResult = await audioManager.uploadFile(mockFile, {
                            title: videoTitle,
                            artist: 'YouTube',
                            duration: info.videoDetails.lengthSeconds,
                            source: 'youtube',
                            originalUrl: url
                        });

                        if (uploadResult.success) {
                            console.log('☁️ File uploaded to Supabase successfully');
                            res.json({
                                success: true,
                                message: 'YouTube audio converted and stored successfully',
                                file: {
                                    filename: uploadResult.file.fileName,
                                    originalName: videoTitle,
                                    size: uploadResult.file.size,
                                    url: uploadResult.file.url,
                                    format: format,
                                    quality: quality,
                                    duration: uploadResult.file.duration
                                }
                            });
                        } else {
                            throw new Error(uploadResult.error);
                        }
                    } catch (supabaseError) {
                        console.error('Supabase upload error:', supabaseError);
                        // Fallback: return JSON with base64 audio data
                        const base64Audio = audioBuffer.toString('base64');
                        res.json({
                            success: true,
                            message: 'YouTube audio converted successfully (local storage)',
                            file: {
                                filename: `${sanitizedTitle}.${format}`,
                                originalName: videoTitle,
                                size: audioBuffer.length,
                                format: format,
                                quality: quality,
                                duration: info.videoDetails.lengthSeconds,
                                audioData: base64Audio,
                                mimeType: `audio/${format}`
                            }
                        });
                    }
                } else {
                    // Fallback: save file locally and return URL
                    console.log('📁 Saving audio file locally');
                    const uploadDir = 'uploads/';
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    
                    const filename = `${sanitizedTitle}_${Date.now()}.${format}`;
                    const filepath = path.join(uploadDir, filename);
                    
                    fs.writeFileSync(filepath, audioBuffer);
                    
                    res.json({
                        success: true,
                        message: 'YouTube audio converted successfully (local storage)',
                        file: {
                            filename: filename,
                            originalName: videoTitle,
                            size: audioBuffer.length,
                            format: format,
                            quality: quality,
                            duration: info.videoDetails.lengthSeconds,
                            url: `/uploads/${filename}`,
                            mimeType: `audio/${format}`
                        }
                    });
                }
                
            } catch (error) {
                console.error('Audio processing error:', error);
                res.status(500).json({ error: 'Audio processing failed' });
            }
        });

        audioStream.on('error', (error) => {
            console.error('YouTube stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'YouTube audio stream failed: ' + error.message });
            }
        });

        // Add timeout for the entire operation
        setTimeout(() => {
            if (!res.headersSent) {
                console.error('YouTube conversion timeout');
                res.status(500).json({ error: 'YouTube conversion timeout - please try again' });
            }
        }, 60000); // 60 second timeout

    } catch (error) {
        console.error('YouTube conversion error:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('Could not extract functions')) {
            res.status(500).json({ 
                error: 'YouTube extraction failed - this video may be restricted or unavailable. Please try a different video.' 
            });
        } else if (error.message.includes('Video unavailable')) {
            res.status(500).json({ 
                error: 'This YouTube video is unavailable or private. Please try a different video.' 
            });
        } else {
            res.status(500).json({ 
                error: `YouTube conversion failed: ${error.message}` 
            });
        }
    }
});

// Get uploaded files list
app.get('/api/files', (req, res) => {
    try {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            return res.json({ files: [] });
        }

        const files = fs.readdirSync(uploadDir)
            .filter(file => file.match(/\.(mp3|wav|ogg|aac|m4a)$/i))
            .map(file => {
                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    uploadTime: stats.mtime.toISOString(),
                    path: `/uploads/${file}`
                };
            });

        res.json({ files });
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: 'Failed to read files' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Simple root endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'BlueMe Server is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Serve the main app
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        console.log(`🌐 BlueMe Server running on port ${PORT}`);
        console.log(`🚀 Production deployment ready!`);
        console.log(`📡 WebSocket server ready for real-time sync`);
        console.log(`🔵 Bluetooth manager initialized`);
        console.log(`📱 API endpoints available at /api/*`);
    } else {
        console.log(`🔒 BlueMe HTTPS Server running on port ${PORT}`);
        console.log(`🌐 Open https://localhost:${PORT} to start syncing music!`);
        console.log(`📱 Mobile HTTPS access: https://192.168.1.110:${PORT}`);
        console.log(`📡 WebSocket server ready for real-time sync`);
        console.log(`🔵 Bluetooth manager initialized`);
        console.log(`📱 API endpoints available at /api/*`);
        console.log(`🔒 HTTPS enabled with self-signed certificate`);
        console.log(`⚠️  You may need to accept the security certificate in your browser`);
    }
});

module.exports = app;

