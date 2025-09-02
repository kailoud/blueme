// Check Node.js version first
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
    console.error('❌ CRITICAL: Node.js 18+ required!');
    console.error(`Current version: ${nodeVersion}`);
    console.error('Please update Node.js to version 18 or higher');
    process.exit(1);
}

console.log(`✅ Node.js version check passed: ${nodeVersion}`);

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Super simple health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Minimal Server Running',
        timestamp: new Date().toISOString(),
        port: PORT,
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'Health Check OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/ping', (req, res) => {
    res.json({ 
        status: 'pong', 
        message: 'Server responding',
        timestamp: new Date().toISOString()
    });
});

// Start server with comprehensive logging
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Minimal Server Started Successfully');
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 Node version: ${process.version}`);
    console.log(`💾 Memory: ${JSON.stringify(process.memoryUsage())}`);
    console.log(`🌍 Platform: ${process.platform}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`🔑 Environment variables: NODE_VERSION=${process.env.NODE_VERSION || 'not set'}`);
    
    // Test endpoints immediately
    setTimeout(() => {
        console.log('🧪 Testing endpoints...');
        require('http').get(`http://localhost:${PORT}/health`, (res) => {
            console.log(`✅ Health endpoint responding: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`❌ Health endpoint error: ${err.message}`);
        });
    }, 1000);
});

// Error handling
server.on('error', (error) => {
    console.error('🚨 Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error('❌ Port already in use');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

console.log('📋 Server configuration complete');
