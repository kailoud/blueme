#!/usr/bin/env node

/**
 * Railway Deployment Helper Script
 * This script helps you deploy BlueMe to Railway with proper configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 BlueMe Railway Deployment Helper');
console.log('=====================================\n');

// Check if required files exist
const requiredFiles = [
    'server.js',
    'package.json',
    'start-railway.js',
    'railway.toml'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please ensure all files are present.');
    process.exit(1);
}

console.log('\n✅ All required files present!');

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
    'express',
    'cors',
    'socket.io',
    '@distube/ytdl-core',
    '@supabase/supabase-js',
    'bcryptjs',
    'jsonwebtoken'
];

let allDepsExist = true;
requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}`);
    } else {
        console.log(`❌ ${dep} - MISSING`);
        allDepsExist = false;
    }
});

if (!allDepsExist) {
    console.log('\n❌ Some required dependencies are missing. Run: npm install');
    process.exit(1);
}

console.log('\n✅ All dependencies present!');

// Display deployment instructions
console.log('\n🚀 Railway Deployment Instructions:');
console.log('=====================================');
console.log('1. Go to https://railway.app');
console.log('2. Sign in with GitHub');
console.log('3. Click "New Project"');
console.log('4. Select "Deploy from GitHub repo"');
console.log('5. Choose your blueme repository');
console.log('6. Set these environment variables:');
console.log('');
console.log('   NODE_ENV=production');
console.log('   PORT=3000');
console.log('   JWT_SECRET=your-super-secret-jwt-key');
console.log('   SUPABASE_URL=your-supabase-url');
console.log('   SUPABASE_ANON_KEY=your-supabase-anon-key');
console.log('   CORS_ORIGIN=https://blueme.app');
console.log('');
console.log('7. Deploy!');
console.log('');
console.log('8. After deployment, update netlify.toml with your Railway URL');
console.log('   Replace: https://blueme-backend-production.up.railway.app');
console.log('   With: https://YOUR-ACTUAL-RAILWAY-URL.up.railway.app');
console.log('');
console.log('9. Commit and push changes to trigger Netlify redeploy');
console.log('');
console.log('🎉 Your BlueMe app will be fully functional!');

// Check if .env file exists
if (fs.existsSync('.env')) {
    console.log('\n⚠️  Warning: .env file detected. Make sure to set environment variables in Railway dashboard.');
} else {
    console.log('\n💡 Tip: Create a .env file for local development using env.example as template.');
}

console.log('\n📚 For more details, see DEPLOYMENT_FIX.md');
