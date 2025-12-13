// Solution: Render and download video chunks sequentially instead of all at once
// This prevents Lambda timeouts and reduces memory usage

import { renderMedia, selectComposition, combineChunks } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import path from 'path';
import fs from 'fs';

// Configuration
const FRAMES_PER_CHUNK = 30; // Reduce this for smaller file sizes per chunk
const OUTPUT_DIR = path.join(process.cwd(), 'temp-chunks');
const FINAL_OUTPUT = path.join(process.cwd(), 'final-video.mp4');

async function renderVideoInSequentialChunks() {
  try {
    // Step 1: Bundle your Remotion project
    console.log('📦 Bundling project...');
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'src/index.ts'),
      webpackOverride: (config) => config,
    });

    // Step 2: Get composition metadata
    console.log('🔍 Getting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MyComposition', // Replace with your composition ID
    });

    const { durationInFrames, fps, width, height } = composition;

    // Step 3: Calculate chunks
    const totalChunks = Math.ceil(durationInFrames / FRAMES_PER_CHUNK);
    console.log(`📊 Total frames: ${durationInFrames}, Chunks: ${totalChunks}`);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const chunkPaths = [];
    const audioChunkPaths = [];

    // Step 4: Render chunks sequentially
    for (let i = 0; i < totalChunks; i++) {
      const startFrame = i * FRAMES_PER_CHUNK;
      const endFrame = Math.min((i + 1) * FRAMES_PER_CHUNK - 1, durationInFrames - 1);
      
      console.log(`\n🎬 Rendering chunk ${i + 1}/${totalChunks} (frames ${startFrame}-${endFrame})...`);

      const chunkOutputPath = path.join(OUTPUT_DIR, `chunk-${i}.mp4`);
      const audioOutputPath = path.join(OUTPUT_DIR, `audio-${i}.wav`);

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264-ts', // Use h264-ts for seamless concatenation
        outputLocation: chunkOutputPath,
        frameRange: [startFrame, endFrame],
        compositionStart: 0, // Always start at 0 for full composition
        audioCodec: 'pcm-16', // Uncompressed audio for concatenation
        separateAudioTo: audioOutputPath, // Render audio separately
        forSeamlessAacConcatenation: true,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          const progress = Math.round((renderedFrames / (endFrame - startFrame + 1)) * 100);
          process.stdout.write(`\r   Progress: ${progress}% (${renderedFrames}/${endFrame - startFrame + 1} frames)`);
        },
        onDownload: (src) => {
          console.log(`\n   ⬇️  Downloading: ${src}`);
        },
      });

      chunkPaths.push(chunkOutputPath);
      audioChunkPaths.push(audioOutputPath);

      console.log(`\n   ✅ Chunk ${i + 1} complete!`);

      // Optional: Download/upload this chunk immediately
      // await uploadChunkToS3(chunkOutputPath);
      // await notifyUserOfProgress(i + 1, totalChunks);
    }

    // Step 5: Combine all chunks into final video
    console.log('\n🔗 Combining chunks into final video...');
    await combineChunks({
      output: FINAL_OUTPUT,
      videoChunks: chunkPaths,
      audioChunks: audioChunkPaths,
      codec: 'h264', // Final output codec
      audioCodec: 'aac', // Final audio codec
      fps,
      durationInFrames,
      framesPerChunk: FRAMES_PER_CHUNK,
      forSeamlessAacConcatenation: true,
      onProgress: ({ totalProgress, frames }) => {
        console.log(`   Combining: ${Math.round(totalProgress * 100)}% (${frames} frames)`);
      },
    });

    // Step 6: Clean up temporary chunks
    console.log('\n🧹 Cleaning up temporary files...');
    for (const chunkPath of [...chunkPaths, ...audioChunkPaths]) {
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    }
    fs.rmdirSync(OUTPUT_DIR);

    console.log(`\n✨ Final video saved to: ${FINAL_OUTPUT}`);
    return FINAL_OUTPUT;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// ALTERNATIVE: Client-Side Progressive Download
// ============================================

async function renderWithProgressiveDownload() {
  const API_ENDPOINT = 'https://your-api.com/render-chunk';
  const totalChunks = 10;
  const downloadedChunks = [];

  for (let i = 0; i < totalChunks; i++) {
    console.log(`Requesting chunk ${i + 1}/${totalChunks}...`);
    
    // Request backend to render single chunk
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chunkIndex: i,
        framesPerChunk: 30,
        compositionId: 'MyComposition',
      }),
    });

    if (!response.ok) {
      throw new Error(`Chunk ${i} failed: ${response.statusText}`);
    }

    // Download the chunk blob
    const blob = await response.blob();
    downloadedChunks.push(blob);

    console.log(`✓ Chunk ${i + 1} downloaded (${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Optional: Show preview of this chunk while others download
    // displayChunkPreview(blob, i);
  }

  // Combine chunks on client side (if needed)
  // Or let backend combine them in the final step
  console.log('All chunks downloaded!');
  return downloadedChunks;
}

// ============================================
// BACKEND API ENDPOINT EXAMPLE (Express.js)
// ============================================

/*
app.post('/render-chunk', async (req, res) => {
  const { chunkIndex, framesPerChunk, compositionId } = req.body;
  
  const startFrame = chunkIndex * framesPerChunk;
  const endFrame = (chunkIndex + 1) * framesPerChunk - 1;
  
  const outputPath = `/tmp/chunk-${chunkIndex}.mp4`;
  
  await renderMedia({
    composition: await selectComposition({ serveUrl, id: compositionId }),
    serveUrl,
    outputLocation: outputPath,
    frameRange: [startFrame, endFrame],
    codec: 'h264-ts',
    audioCodec: 'pcm-16',
    separateAudioTo: `/tmp/audio-${chunkIndex}.wav`,
    forSeamlessAacConcatenation: true,
  });
  
  // Stream the file back to client
  res.sendFile(outputPath, () => {
    fs.unlinkSync(outputPath);
  });
});
*/

// Run the sequential rendering
// renderVideoInSequentialChunks();

