# Use Node.js 20 with FFmpeg pre-installed
FROM node:20-bullseye

# Install FFmpeg and related libraries
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libswscale-dev \
    libswresample-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Add File API polyfill for Node.js compatibility
RUN echo "global.File = global.File || class File { constructor() { throw new Error('File API not supported'); } };" > /app/polyfill.js

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
