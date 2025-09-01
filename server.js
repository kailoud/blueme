const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const ytdl = require('ytdl-core');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🎧 New client connected:', socket.id);

    // Join a sync room
    socket.on('join-sync-room', (roomId) => {
        socket.join(roomId);
        console.log(`🎵 Client ${socket.id} joined sync room: ${roomId}`);
        socket.to(roomId).emit('user-joined', { userId: socket.id });
    });

    // Handle music sync events
    socket.on('play-music', (data) => {
        socket.to(data.roomId).emit('music-play', {
            trackId: data.trackId,
            timestamp: data.timestamp,
            userId: socket.id
        });
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

    // Handle device connection status
    socket.on('device-connected', (data) => {
        socket.to(data.roomId).emit('device-status', {
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            status: 'connected',
            userId: socket.id
        });
    });

    socket.on('device-disconnected', (data) => {
        socket.to(data.roomId).emit('device-status', {
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            status: 'disconnected',
            userId: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('👋 Client disconnected:', socket.id);
    });
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'SyncBeats Pro Server Running',
        timestamp: new Date().toISOString()
    });
});

// Upload audio file
app.post('/api/upload', upload.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path,
            uploadTime: new Date().toISOString()
        };

        console.log('📁 Audio file uploaded:', fileInfo.filename);
        
        res.json({
            success: true,
            message: 'Audio file uploaded successfully',
            file: fileInfo
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Convert YouTube URL to audio
app.post('/api/convert-youtube', async (req, res) => {
    try {
        const { url, format = 'mp3', quality = '192' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        console.log('🎵 Converting YouTube URL:', url);

        // Get video info
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title;
        const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Download audio stream
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const outputPath = `uploads/${sanitizedTitle}-${Date.now()}.${format}`;
        const writeStream = fs.createWriteStream(outputPath);

        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            const stats = fs.statSync(outputPath);
            res.json({
                success: true,
                message: 'YouTube audio converted successfully',
                file: {
                    filename: path.basename(outputPath),
                    originalName: videoTitle,
                    size: stats.size,
                    path: outputPath,
                    format: format,
                    quality: quality
                }
            });
        });

        writeStream.on('error', (error) => {
            console.error('Conversion error:', error);
            res.status(500).json({ error: 'Audio conversion failed' });
        });

    } catch (error) {
        console.error('YouTube conversion error:', error);
        res.status(500).json({ error: 'YouTube conversion failed' });
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

// Serve the main app
app.get('/', (req, res) => {
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🎵 SyncBeats Pro Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to start syncing music!`);
    console.log(`📡 WebSocket server ready for real-time sync`);
});

module.exports = app;

