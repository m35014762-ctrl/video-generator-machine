import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set FFmpeg path (assumes FFmpeg is installed)
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg');

export function generateVideo(options) {
  return new Promise((resolve, reject) => {
    const {
      outputPath,
      duration = 60,
      resolution = '1920x1080',
      fps = 30,
      audioPath,
      effects = {}
    } = options;

    const [width, height] = resolution.split('x').map(Number);

    let command = ffmpeg()
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Video generation completed');
        resolve(outputPath);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      });

    // Generate base video with color/pattern
    command = command
      .input('color=c=blue:s=' + width + 'x' + height + ':d=' + (duration / 1000))
      .inputFormat('lavfi')
      .fps(fps);

    // Add audio if provided
    if (audioPath && fs.existsSync(audioPath)) {
      command = command
        .input(audioPath)
        .audioCodec('aac')
        .audioBitrate('128k');
    } else {
      // Generate silence if no audio
      command = command
        .input('anullsrc=r=44100:cl=mono')
        .inputFormat('lavfi')
        .audioBitrate('128k');
    }

    // Apply video codec and settings
    command = command
      .videoCodec('libx264')
      .preset('medium')
      .bitrate('5000k')
      .size(width + 'x' + height)
      .fps(fps)
      .format('mp4')
      .output(outputPath, { end: duration / 1000 })
      .run();
  });
}

// Generate video with effects
export function generateVideoWithEffects(options) {
  const { effectType = 'fade', ...rest } = options;
  
  // Add effect filters based on type
  const filterMap = {
    fade: 'fade=t=in:st=0:d=1,fade=t=out:st=' + ((rest.duration / 1000) - 1) + ':d=1',
    zoom: 'scale=iw*1.1:ih*1.1,scale=1920:1080',
    rotate: 'rotate=2*PI*t/5',
    blur: 'boxblur=3:2'
  };

  return generateVideo(rest);
}
