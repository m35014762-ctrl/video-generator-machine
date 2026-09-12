# Video Generator Machine 🎬

A fully functional video generator machine website that supports creating videos from **1 to 23 minutes** with advanced features.

## Features

✅ **Duration Support**: Create videos from 1 minute to 23 minutes  
✅ **Multiple Resolutions**: 480p, 720p, 1080p, 4K support  
✅ **Custom FPS**: 24, 30, or 60 FPS  
✅ **Audio Integration**: Add your own audio tracks  
✅ **Video Effects**: Fade, Zoom, Rotate, Blur effects  
✅ **Real-time Progress**: Live progress tracking  
✅ **Easy Download**: Direct video download  
✅ **Modern UI**: Beautiful, responsive interface  

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
  - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
  - **macOS**: `brew install ffmpeg`
  - **Windows**: Download from https://ffmpeg.org/download.html

## Installation

1. Clone the repository:
```bash
git clone https://github.com/m35014762-ctrl/video-generator-machine.git
cd video-generator-machine
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
cp .env.example .env
```

## Usage

### Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### For development with auto-reload:
```bash
npm run dev
```

## How to Use

1. **Open** the website in your browser
2. **Enter** video duration (1-23 minutes)
3. **Select** resolution and FPS
4. **Optional**: Upload an audio file
5. **Optional**: Choose video effects
6. **Click** "Generate Video"
7. **Download** when ready

## API Endpoints

### Generate Video
```
POST /api/generate-video
Content-Type: multipart/form-data

Parameters:
- duration: number (60-1380 seconds, i.e., 1-23 minutes)
- resolution: string (e.g., "1920x1080")
- fps: number (24, 30, or 60)
- audioFile: file (optional)
- effects: JSON array of effects (optional)
```

### Download Video
```
GET /api/download/:videoId
```

### Check Video Status
```
GET /api/video-status/:videoId
```

## Project Structure

```
video-generator-machine/
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # Styling
│   └── app.js           # Frontend logic
├── src/
│   └── videoGenerator.js # Video generation logic
├── uploads/             # Uploaded files directory
├── output/              # Generated videos directory
├── server.js            # Express server
├── package.json         # Dependencies
└── README.md           # This file
```

## Supported Formats

### Audio
- MP3
- WAV
- AAC
- OGG

### Output
- MP4 (H.264 codec)
- Audio: AAC (128kbps)

## Performance Notes

- **1 minute video**: ~30 seconds generation time
- **5 minute video**: ~2-3 minutes generation time
- **23 minute video**: ~10-15 minutes generation time

*Times vary based on resolution, FPS, and system specs*

## Troubleshooting

### FFmpeg not found
- Ensure FFmpeg is installed and in your PATH
- Set `FFMPEG_PATH` in `.env` to the full path of ffmpeg

### Out of memory errors
- Reduce resolution or use lower FPS
- Close other applications

### Slow video generation
- Check CPU/RAM usage
- Reduce resolution for faster generation
- Use lower FPS setting

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open a GitHub issue.

---

**Created with ❤️ by Video Generator Machine Team**
