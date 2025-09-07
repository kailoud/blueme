# 🎵 BlueMe

**Share music with friends wirelessly via Bluetooth**

A modern web application that enables real-time music synchronization across multiple Bluetooth devices. Built with Node.js, Express, Socket.IO, and Web Bluetooth API.

## 🚀 Deployment Status
- **Frontend**: ✅ Deployed to Netlify (blueme.app)
- **Backend**: 🔄 Deploying to Railway with Supabase integration
- **Database**: ✅ Supabase configured and ready

## ✨ Features

- **🔗 Bluetooth Device Management** - Connect up to 2 friends for shared listening
- **🎵 Real-time Music Sync** - Synchronized playback across all connected devices
- **📁 File Upload** - Drag & drop or click to upload audio files
- **🔄 Audio Converter** - Convert URLs to high-quality audio formats
- **📺 YouTube Integration** - Convert YouTube videos to audio
- **🎛 Advanced Player Controls** - Play, pause, seek, volume control
- **📱 Responsive Design** - Works on mobile and desktop
- **⚡ Real-time Updates** - Live sync status and device monitoring
- **🎨 Modern UI** - Beautiful glassmorphism design with animations

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn
- Modern browser with Web Bluetooth support (Chrome, Edge, Opera)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd blueme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📦 Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Serve static files (alternative)
npm run serve

# Build project (placeholder)
npm run build
```

## 🔧 API Endpoints

### Health Check
```
GET /api/health
```

### File Upload
```
POST /api/upload
Content-Type: multipart/form-data
Body: audio file
```

### YouTube Conversion
```
POST /api/convert-youtube
Content-Type: application/json
Body: { "url": "youtube-url", "format": "mp3", "quality": "192" }
```

### Get Uploaded Files
```
GET /api/files
```

## 🎧 WebSocket Events

### Client to Server
- `join-sync-room` - Join a music sync room
- `play-music` - Start playing music
- `pause-music` - Pause music
- `seek-music` - Seek to position
- `volume-change` - Change volume
- `device-connected` - Device connection status
- `device-disconnected` - Device disconnection status

### Server to Client
- `user-joined` - New user joined room
- `music-play` - Music started playing
- `music-pause` - Music paused
- `music-seek` - Music seeked to position
- `volume-updated` - Volume changed
- `device-status` - Device status update

## 🏗️ Project Structure

```
syncbeats-pro/
├── public/
│   └── index.html          # Main application
├── uploads/                # Uploaded audio files
├── server.js              # Express server
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔌 Dependencies

### Production
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **multer** - File upload handling
- **socket.io** - Real-time communication
- **ytdl-core** - YouTube video downloader
- **ffmpeg-static** - Audio processing

### Development
- **nodemon** - Auto-restart on file changes
- **concurrently** - Run multiple commands

## 🌐 Browser Support

- **Chrome** 56+ (with Web Bluetooth)
- **Edge** 79+ (with Web Bluetooth)
- **Opera** 43+ (with Web Bluetooth)
- **Firefox** (limited Web Bluetooth support)
- **Safari** (no Web Bluetooth support)

## 🔒 Security Notes

- Web Bluetooth API requires HTTPS in production
- File uploads are limited to 50MB
- Only audio files are accepted for upload
- CORS is enabled for development

## 🎯 Usage Instructions

1. **Connect Devices**
   - Click "Find Audio Devices" to scan for Bluetooth devices
   - Select your headphones or speakers
   - Connect up to 2 devices for shared listening

2. **Upload Music**
   - Drag & drop audio files onto the upload area
   - Or click to browse and select files
   - Supported formats: MP3, WAV, OGG, AAC

3. **Convert YouTube**
   - Paste a YouTube URL in the converter
   - Choose format and quality
   - Click "Convert Audio"

4. **Sync & Play**
   - Load a track into the player
   - Press play to start synchronized playback
   - All connected devices will play in sync

## 🎮 Keyboard Shortcuts

- **Spacebar** - Play/Pause
- **Left Arrow** - Previous track
- **Right Arrow** - Next track
- **M** - Mute/Unmute

## 🐛 Troubleshooting

### Bluetooth Issues
- Ensure your browser supports Web Bluetooth
- Use HTTPS in production
- Check device pairing mode
- Try refreshing the page

### Upload Issues
- Check file size (max 50MB)
- Ensure file is audio format
- Clear browser cache

### Server Issues
- Check if port 3000 is available
- Ensure Node.js version is 16+
- Check console for error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Web Bluetooth API for device connectivity
- Socket.IO for real-time communication
- Express.js for the backend framework
- Modern CSS for the beautiful UI

---

**Made with ❤️ for music lovers everywhere**

# Deployment trigger Sun Sep  7 15:31:04 BST 2025
# EMERGENCY FIX - YouTube conversion broken - Sun Sep  7 15:36:20 BST 2025
# EMERGENCY: Railway app not found - Sun Sep  7 15:45:20 BST 2025
# Force Netlify redeploy - Sun Sep  7 17:05:10 BST 2025
