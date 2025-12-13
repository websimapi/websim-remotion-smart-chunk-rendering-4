import { useState, useEffect, useRef } from "react";

export const useRendering = (config, playerRef) => {
  const { duration, fps, strategy, customFrames, customConcurrency, combineChunks } = config;

  // Initialize with valid defaults to prevent Player crash on first render
  const [stats, setStats] = useState(() => {
    const frames = duration * fps;
    const targetChunks = 25;
    const fpc = Math.ceil(frames / targetChunks);
    const cc = Math.ceil(frames / fpc);
    return { totalFrames: frames, chunkCount: cc, framesPerChunk: fpc };
  });

  const [renderStatus, setRenderStatus] = useState({}); // { 0: 'pending', 1: 'rendering', 2: 'complete' }
  const [recording, setRecording] = useState(false);

  // Audio Context Refs for recording
  const audioCtxRef = useRef(null);
  const audioDestRef = useRef(null);
  const musicRef = useRef(null);
  const waterRef = useRef(null);

  // Initialize Audio Context for recording capture
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();

    // Music
    const music = new Audio("/api%20-%20Sink%20Battle%20-%20Sonauto.ogg");
    music.addEventListener("error", (e) => console.warn("Music load error", e));
    music.crossOrigin = "anonymous";
    music.preload = "auto";
    music.volume = 0.8; 
    music.load();
    const musicSource = ctx.createMediaElementSource(music);
    musicSource.connect(dest);

    // Water SFX
    const water = new Audio("/asset_running_water.mp3");
    water.crossOrigin = "anonymous";
    water.preload = "auto";
    water.volume = 0.8; // Increased volume for better audibility in download
    water.loop = true;
    water.load();
    const waterSource = ctx.createMediaElementSource(water);
    waterSource.connect(dest);

    audioCtxRef.current = ctx;
    audioDestRef.current = dest;
    musicRef.current = music;
    waterRef.current = water;

    return () => {
      if (ctx.state !== 'closed') ctx.close();
      music.pause();
      music.src = "";
      water.pause();
      water.src = "";
    };
  }, []);

  // Update stats when config changes
  useEffect(() => {
    const totalFrames = duration * fps;
    let framesPerChunk, chunkCount;

    if (strategy === "auto") {
      const targetChunks = 25;
      framesPerChunk = Math.ceil(totalFrames / targetChunks);
      chunkCount = Math.ceil(totalFrames / framesPerChunk);
    } else if (strategy === "frames") {
      framesPerChunk = customFrames;
      chunkCount = Math.ceil(totalFrames / framesPerChunk);
    } else {
      chunkCount = customConcurrency;
      framesPerChunk = Math.ceil(totalFrames / chunkCount);
    }

    setStats({ totalFrames, chunkCount, framesPerChunk });

    // Reset statuses
    const newStatus = {};
    for(let i=0; i<chunkCount; i++) newStatus[i] = 'pending';
    setRenderStatus(newStatus);
  }, [duration, fps, strategy, customFrames, customConcurrency]);

  const recordChunk = async (chunkIndex) => {
    if (recording) return;
    setRecording(true);

    const startFrame = chunkIndex * stats.framesPerChunk;
    const endFrame = Math.min((chunkIndex + 1) * stats.framesPerChunk - 1, stats.totalFrames - 1);
    const durationFrames = endFrame - startFrame + 1;
    const durationMs = (durationFrames / fps) * 1000;

    // Update status UI
    setRenderStatus(prev => ({ ...prev, [chunkIndex]: 'rendering' }));

    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Canvas not found! Wait for player to load.");
      setRecording(false);
      return;
    }

    // Initialize MediaRecorder
    const canvasStream = canvas.captureStream(fps);
    const audioStream = audioDestRef.current.stream;

    // Combine video and audio tracks
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: "video/webm;codecs=vp9" });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chunk-${chunkIndex + 1}_frames-${startFrame}-${endFrame}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRenderStatus(prev => ({ ...prev, [chunkIndex]: 'complete' }));
      setRecording(false);
    };

    // Control Player & Audio
    if (playerRef.current) {
      // Ensure audio context is running
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      playerRef.current.seekTo(startFrame);
      if (musicRef.current) musicRef.current.currentTime = startFrame / fps;
      if (waterRef.current) {
        const d = waterRef.current.duration || 28;
        waterRef.current.currentTime = (startFrame / fps) % d;
      }

      // Give Three.js a moment to render the first frame
      await new Promise(r => setTimeout(r, 500));

      mediaRecorder.start();
      playerRef.current.play();
      if (musicRef.current) musicRef.current.play().catch(e => console.warn("Music play failed", e));
      if (waterRef.current) waterRef.current.play().catch(e => console.warn("Water play failed", e));

      // Stop after duration
      setTimeout(() => {
        playerRef.current.pause();
        if (musicRef.current) musicRef.current.pause();
        if (waterRef.current) waterRef.current.pause();
        mediaRecorder.stop();
      }, durationMs + 100); // Small buffer
    }
  };

  const renderCombinedVideo = async () => {
    if (recording) return;
    setRecording(true);

    // Reset status to pending
    const newStatus = {};
    for(let i=0; i<stats.chunkCount; i++) newStatus[i] = 'pending';
    setRenderStatus(newStatus);

    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Canvas not found! Wait for player to load.");
      setRecording(false);
      return;
    }

    // Capture combined stream
    const canvasStream = canvas.captureStream(fps);
    const audioStream = audioDestRef.current.stream;
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: "video/webm;codecs=vp9" });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `combined_video_${duration}s.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecording(false);

      // Mark all as complete
      const finalStatus = {};
      for(let i=0; i<stats.chunkCount; i++) finalStatus[i] = 'complete';
      setRenderStatus(finalStatus);
    };

    mediaRecorder.start();
    mediaRecorder.pause(); // Start in paused state

    // Ensure audio context is running
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    for (let i = 0; i < stats.chunkCount; i++) {
        setRenderStatus(prev => ({ ...prev, [i]: 'rendering' }));

        const startFrame = i * stats.framesPerChunk;
        const endFrame = Math.min((i + 1) * stats.framesPerChunk - 1, stats.totalFrames - 1);
        const durationFrames = endFrame - startFrame + 1;
        const durationMs = (durationFrames / fps) * 1000;

        if (playerRef.current) {
            playerRef.current.pause();
            if (musicRef.current) musicRef.current.pause();
            if (waterRef.current) waterRef.current.pause();

            playerRef.current.seekTo(startFrame);
            if (musicRef.current) musicRef.current.currentTime = startFrame / fps;
            if (waterRef.current) {
                const d = waterRef.current.duration || 28;
                waterRef.current.currentTime = (startFrame / fps) % d;
            }

            // Wait for render/buffer (allow Three.js to render frame)
            await new Promise(r => setTimeout(r, 800));

            mediaRecorder.resume();
            playerRef.current.play();
            if (musicRef.current) musicRef.current.play().catch(e => console.warn("Music play failed", e));
            if (waterRef.current) waterRef.current.play().catch(e => console.warn("Water play failed", e));

            // Record for duration
            await new Promise(r => setTimeout(r, durationMs));

            playerRef.current.pause();
            if (musicRef.current) musicRef.current.pause();
            if (waterRef.current) waterRef.current.pause();
            mediaRecorder.pause();

            // Small stability buffer before next chunk
            await new Promise(r => setTimeout(r, 100));
        }

        setRenderStatus(prev => ({ ...prev, [i]: 'complete' }));
    }

    mediaRecorder.stop();
  };

  const renderAllChunks = async () => {
    if (combineChunks) {
      await renderCombinedVideo();
    } else {
      for (let i = 0; i < stats.chunkCount; i++) {
        if (renderStatus[i] !== 'complete') {
          await recordChunk(i);
          // Wait a bit between chunks
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
  };

  return {
    stats,
    renderStatus,
    recording,
    recordChunk,
    renderAllChunks
  };
};