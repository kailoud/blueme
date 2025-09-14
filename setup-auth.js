#!/usr/bin/env node

/**
 * BlueMe Authentication Setup Script
 * Helps configure authentication for the BlueMe application
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔐 BlueMe Authentication Setup');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    // Generate a secure JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('base64');
    
    const envContent = `# BlueMe Environment Configuration
# Generated on ${new Date().toISOString()}

# Supabase Configuration (Optional - for cloud storage and authentication)
# Get these from https://supabase.com > Your Project > Settings > API
SUPABASE_URL=
SUPABASE_ANON_KEY=

# JWT Secret for Authentication (Auto-generated)
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: SSL Certificate paths for HTTPS
# SSL_CERT_PATH=./cert.pem
# SSL_KEY_PATH=./key.pem
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created with secure JWT secret');
} else {
    console.log('✅ .env file already exists');
}

// Check if database schema needs to be updated
console.log('\n📊 Database Setup:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Run the following SQL script:');
console.log('   File: database/auth-schema-update.sql');
console.log('\nThis will add authentication support to your database.');

// Check if required dependencies are installed
console.log('\n📦 Dependencies:');
try {
    require('jsonwebtoken');
    require('bcryptjs');
    require('express-rate-limit');
    console.log('✅ All authentication dependencies are installed');
} catch (error) {
    console.log('❌ Missing dependencies. Run: npm install jsonwebtoken bcryptjs express-rate-limit');
}

// Check if authentication files exist
console.log('\n🔧 Authentication Files:');
const authFiles = [
    'middleware/auth.js',
    'routes/auth.js',
    'public/js/auth.js',
    'public/css/auth.css',
    'database/auth-schema-update.sql'
];

authFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - Missing!`);
    }
});

console.log('\n🚀 Setup Complete!');
console.log('\nNext Steps:');
console.log('1. Update your .env file with Supabase credentials (optional)');
console.log('2. Run the database schema update in Supabase');
console.log('3. Start your server: npm start');
console.log('4. Open your app and click the auth button to test authentication');
console.log('\n📖 Features Added:');
console.log('• User registration and login');
console.log('• JWT-based authentication');
console.log('• Profile management');
console.log('• Password change functionality');
console.log('• Account deletion');
console.log('• Non-intrusive UI that doesn\'t affect existing functionality');
console.log('• Guest mode still works for unauthenticated users');
console.log('\n🔒 Security Features:');
console.log('• Rate limiting on auth endpoints');
console.log('• Bcrypt password hashing');
console.log('• JWT token expiration');
console.log('• Row Level Security (RLS) policies');
console.log('• Input validation and sanitization');
