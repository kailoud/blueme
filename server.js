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

// Enhanced API endpoints
app.get('/api/health', (req, res) => {
    const deviceCount = bluetoothManager.getConnectedDevices().length;
    res.json({ 
        status: 'healthy', 
        message: 'BlueMe Server Running',
        timestamp: new Date().toISOString(),
        connectedDevices: deviceCount,
        version: '2.0.0'
    });
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
    console.log(`🎵 BlueMe Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to start syncing music!`);
    console.log(`📡 WebSocket server ready for real-time sync`);
    console.log(`🔵 Bluetooth manager initialized`);
    console.log(`📱 API endpoints available at /api/*`);
});

module.exports = app;

