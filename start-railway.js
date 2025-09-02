#!/usr/bin/env node

// Railway-specific startup script
console.log('🚀 Starting BlueMe Server for Railway...');
console.log('📦 Node version:', process.version);
console.log('🌍 Platform:', process.platform);
console.log('🔧 Environment:', process.env.NODE_ENV || 'production');
console.log('📡 Port:', process.env.PORT || 3000);

// Import and start the main server
try {
    require('./server.js');
    console.log('✅ Server started successfully');
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}
