import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { generateVideo } from './src/videoGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload and output directories exist
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
const publicDir = path.join(__dirname, 'public');

[uploadDir, outputDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// Middleware
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.post('/api/generate-video', upload.single('audioFile'), async (req, res) => {
  try {
    const { duration, resolution, fps, effects } = req.body;
    const audioPath = req.file ? req.file.path : null;

    // Validate duration (1-23 minutes)
    const durationMin = parseInt(duration) || 60;
    if (durationMin < 60 || durationMin > 1380) {
      return res.status(400).json({ error: 'Duration must be between 1 and 23 minutes' });
    }

    const videoId = uuidv4();
    const outputPath = path.join(outputDir, `${videoId}.mp4`);

    // Generate video
    await generateVideo({
      outputPath,
      duration: durationMin,
      resolution: resolution || '1920x1080',
      fps: parseInt(fps) || 30,
      audioPath,
      effects: effects ? JSON.parse(effects) : {}
    });

    res.json({
      success: true,
      videoId,
      downloadUrl: `/api/download/${videoId}`,
      message: 'Video generated successfully'
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/download/:videoId', (req, res) => {
  try {
    const videoPath = path.join(outputDir, `${req.params.videoId}.mp4`);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.download(videoPath, `video-${req.params.videoId}.mp4`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/video-status/:videoId', (req, res) => {
  try {
    const videoPath = path.join(outputDir, `${req.params.videoId}.mp4`);
    const exists = fs.existsSync(videoPath);
    
    res.json({
      videoId: req.params.videoId,
      ready: exists,
      path: exists ? `/api/download/${req.params.videoId}` : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Video Generator Machine running at http://localhost:${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Output directory: ${outputDir}`);
});
