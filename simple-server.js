const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'BlueMe Backend API is running',
        timestamp: new Date().toISOString()
    });
});

// YouTube conversion endpoint
app.post('/api/convert-youtube', async (req, res) => {
    try {
        const { url, format = 'mp3', quality = '192', userId } = req.body;
        
        console.log('YouTube conversion request:', { url, format, quality, userId });
        
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }
        
        // For now, return a mock response to test the connection
        // In production, this would use ytdl-core to convert the video
        res.json({
            success: true,
            message: 'YouTube conversion endpoint is working!',
            url: url,
            format: format,
            quality: quality,
            userId: userId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('YouTube conversion error:', error);
        res.status(500).json({ 
            error: 'YouTube conversion failed', 
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BlueMe Backend API running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/`);
    console.log(`🎵 YouTube API: http://localhost:${PORT}/api/convert-youtube`);
});

module.exports = app;
