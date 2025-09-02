# 🚀 Supabase Setup Guide for BlueMe Audio Converter

## 🎯 **What You'll Get:**

✅ **Professional audio file storage** with CDN  
✅ **Database for metadata** (artist, title, duration, etc.)  
✅ **Audio conversion tracking**  
✅ **User management** and playlists  
✅ **Real-time sync** across devices  
✅ **Scalable architecture** ready for production  

## 🌐 **Step 1: Create Supabase Project**

### **1.1 Go to Supabase**
- **Visit**: [supabase.com](https://supabase.com)
- **Click "Start your project"**
- **Sign in** with GitHub

### **1.2 Create New Project**
- **Click "New Project"**
- **Choose organization** (create one if needed)
- **Project name**: `blueme-audio`
- **Database password**: Create a strong password
- **Region**: Choose closest to your users
- **Click "Create new project"**

### **1.3 Wait for Setup**
- **Database setup**: 2-3 minutes
- **You'll see**: "Your project is ready!"

## 🔑 **Step 2: Get Your Credentials**

### **2.1 Project Settings**
- **Go to "Settings"** → **"API"**
- **Copy these values**:

```
Project URL: https://your-project-id.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2.2 Add to Railway Environment Variables**
- **Go to your Railway project**
- **Click on "blueme" service**
- **Go to "Variables" tab**
- **Add these variables**:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

## 🗄️ **Step 3: Set Up Database**

### **3.1 SQL Editor**
- **Go to "SQL Editor"** in Supabase
- **Click "New query"**

### **3.2 Run Schema**
- **Copy the entire content** from `database/schema.sql`
- **Paste it** in the SQL Editor
- **Click "Run"**

### **3.3 Verify Tables**
- **Go to "Table Editor"**
- **You should see**:
  - `users`
  - `audio_files`
  - `audio_conversions`
  - `playlists`
  - `bluetooth_devices`
  - `sync_sessions`
  - `sync_participants`

## 📁 **Step 4: Set Up Storage**

### **4.1 Storage Buckets**
- **Go to "Storage"** in Supabase
- **Buckets should auto-create** from our code
- **If not, create manually**:

```
Bucket Name: audio-files
Public: false
File size limit: 50MB
Allowed MIME types: audio/*

Bucket Name: converted-audio
Public: false
File size limit: 50MB
Allowed MIME types: audio/*

Bucket Name: temp-files
Public: false
File size limit: 50MB
Allowed MIME types: audio/*
```

### **4.2 Storage Policies**
- **Click on each bucket**
- **Go to "Policies" tab**
- **Add policies** (our schema handles this)

## 🔧 **Step 5: Test Your Setup**

### **5.1 Install Dependencies**
```bash
cd /Users/kailoud/Desktop/Blueme
npm install
```

### **5.2 Test Locally**
```bash
npm run dev
```

### **5.3 Test API Endpoints**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test file upload (will use Supabase if configured)
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@test-audio.mp3"
```

## 🎵 **Step 6: What You Can Do Now**

### **✅ Audio File Management**
- **Upload** MP3, WAV, OGG, AAC files
- **Store** in Supabase with metadata
- **Organize** by user and playlists
- **Share** with other users

### **✅ Audio Conversion**
- **Convert** between formats
- **Quality settings** (128kbps to 320kbps)
- **Track conversions** in database
- **Download** converted files

### **✅ User Features**
- **User accounts** and authentication
- **Personal libraries** of music
- **Playlists** creation and sharing
- **Sync sessions** with friends

### **✅ Bluetooth Integration**
- **Device management** database
- **Connection tracking**
- **Battery monitoring**
- **Audio capability** detection

## 🚀 **Step 7: Deploy to Production**

### **7.1 Railway Backend**
- **Already deployed** with your changes
- **Auto-updates** from GitHub

### **7.2 Frontend (Netlify)**
- **Already deployed** at `blueme.app`
- **Auto-updates** from GitHub

### **7.3 Test Full System**
1. **Visit**: `blueme.app`
2. **Upload audio file**
3. **Convert format**
4. **Test Bluetooth sync**

## 💡 **Pro Tips:**

### **Performance Optimization**
- **CDN**: Supabase provides global CDN
- **Database**: PostgreSQL with automatic indexing
- **Storage**: Optimized for audio files
- **Real-time**: WebSocket subscriptions

### **Security Features**
- **Row Level Security** (RLS) enabled
- **User isolation** (users only see their files)
- **Secure file access** with signed URLs
- **Authentication** ready for future

### **Scalability**
- **Handles thousands** of users
- **Millions** of audio files
- **Real-time sync** across devices
- **Professional** architecture

## 🎉 **You're Ready!**

**Your BlueMe app now has enterprise-grade audio management!**

- **Frontend**: Beautiful interface at `blueme.app`
- **Backend**: Powerful server on Railway
- **Database**: Professional PostgreSQL on Supabase
- **Storage**: Global CDN for audio files
- **Features**: Full audio converter + Bluetooth sync

## 🔍 **Need Help?**

**Common Issues:**
1. **Environment variables** not set in Railway
2. **Database schema** not run in Supabase
3. **Storage buckets** not created
4. **CORS issues** (handled by our code)

**Next Steps:**
1. **Set up Supabase** following this guide
2. **Test locally** with `npm run dev`
3. **Deploy changes** to Railway
4. **Test full system** at `blueme.app`

**Your BlueMe app is now a professional music platform!** 🎵✨
