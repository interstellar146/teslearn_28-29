import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ── Duration map ───────────────────────────────────────────────────── */
const durationMap = [
  { speaker: 'iShowSpeed', from: 0, to: 8.928 },
  { speaker: 'Dr. Kalam', from: 8.928, to: 23.868 },
  { speaker: 'iShowSpeed', from: 23.868, to: 29.124 },
  { speaker: 'Dr. Kalam', from: 29.124, to: 39.924 },
  { speaker: 'iShowSpeed', from: 39.924, to: 46.44 },
  { speaker: 'Dr. Kalam', from: 46.44, to: 55.224 },
  { speaker: 'iShowSpeed', from: 55.224, to: 61.92 },
  { speaker: 'Dr. Kalam', from: 61.92, to: 69.264 },
  { speaker: 'iShowSpeed', from: 69.264, to: 74.7 },
  { speaker: 'Dr. Kalam', from: 74.7, to: 80.856 },
  { speaker: 'iShowSpeed', from: 80.856, to: 86.184 },
  { speaker: 'Dr. Kalam', from: 86.184, to: 95.184 },
  { speaker: 'iShowSpeed', from: 95.184, to: 98.208 },
  { speaker: 'Dr. Kalam', from: 98.208, to: 107.388 },
  { speaker: 'iShowSpeed', from: 107.388, to: 113.472 },
  { speaker: 'Dr. Kalam', from: 113.472, to: 125.136 },
  { speaker: 'iShowSpeed', from: 125.136, to: 129.672 },
  { speaker: 'Dr. Kalam', from: 129.672, to: 135.828 },
  { speaker: 'iShowSpeed', from: 135.828, to: 142.704 },
  { speaker: 'Dr. Kalam', from: 142.704, to: 152.172 },
  { speaker: 'iShowSpeed', from: 152.172, to: 158.436 },
  { speaker: 'Dr. Kalam', from: 158.436, to: 166.608 },
  { speaker: 'iShowSpeed', from: 166.608, to: 170.964 },
];

const TOTAL_DURATION = 170.964;
const WAVE_BARS = 32;

/* ── Speaker config ─────────────────────────────────────────────────── */
const speakerConfig: Record<string, { initials: string; role: string; accent: string }> = {
  'Dr. Kalam': { initials: 'AK', role: 'Visionary Scientist', accent: '#f59e0b' },
  iShowSpeed:  { initials: 'IS', role: 'Podcast Host',        accent: '#8b5cf6' },
};

export default function Podcast() {
  const audioRef       = useRef<HTMLAudioElement>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const animRef        = useRef(0);
  const kalamCanvas    = useRef<HTMLCanvasElement>(null);
  const speedCanvas    = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(TOTAL_DURATION);
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [volume, setVolume]             = useState(80);
  const [isMuted, setIsMuted]           = useState(false);

  const fmt = (s: number) => {
    if (isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  /* ── who's talking? ──────────────────────────────────────────────── */
  useEffect(() => {
    const turn = durationMap.find((t) => currentTime >= t.from && currentTime < t.to);
    setActiveSpeaker(turn?.speaker || '');
  }, [currentTime]);

  /* ── Web Audio analyser (created once) ───────────────────────────── */
  const ensureAnalyser = useCallback(() => {
    if (analyserRef.current || !audioRef.current) return;
    const ctx = new AudioContext();
    const an  = ctx.createAnalyser();
    an.fftSize = 256;
    const src = ctx.createMediaElementSource(audioRef.current);
    src.connect(an);
    an.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = an;
  }, []);

  /* ── draw waveform on a given canvas ─────────────────────────────── */
  const drawBars = useCallback((
    canvas: HTMLCanvasElement | null,
    data: Uint8Array,
    color: string,
    active: boolean,
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barW = w / WAVE_BARS;
    const step = Math.floor(data.length / WAVE_BARS);

    for (let i = 0; i < WAVE_BARS; i++) {
      const val  = active ? data[i * step] / 255 : 0;
      const barH = Math.max(2, val * h * 0.8);
      const x = i * barW;
      const y = (h - barH) / 2;

      ctx.fillStyle = color;
      ctx.globalAlpha = active ? 0.45 + val * 0.55 : 0.12;
      ctx.beginPath();
      ctx.roundRect(x + 1, y, barW - 2, barH, 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  /* ── animation loop ──────────────────────────────────────────────── */
  const tick = useCallback(() => {
    const an = analyserRef.current;
    if (!an) { animRef.current = requestAnimationFrame(tick); return; }
    const buf = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(buf);

    drawBars(kalamCanvas.current, buf, '#f59e0b', activeSpeaker === 'Dr. Kalam');
    drawBars(speedCanvas.current, buf, '#8b5cf6', activeSpeaker === 'iShowSpeed');

    animRef.current = requestAnimationFrame(tick);
  }, [activeSpeaker, drawBars]);

  useEffect(() => {
    if (isPlaying) animRef.current = requestAnimationFrame(tick);
    else cancelAnimationFrame(animRef.current);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, tick]);

  /* ── resize canvases ─────────────────────────────────────────────── */
  useEffect(() => {
    const resize = () => {
      [kalamCanvas, speedCanvas].forEach((ref) => {
        const c = ref.current;
        if (c?.parentElement) { c.width = c.parentElement.clientWidth; c.height = 100; }
      });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  /* ── controls ────────────────────────────────────────────────────── */
  const togglePlay = () => {
    if (!audioRef.current) return;
    ensureAnalyser();
    if (audioRef.current.paused) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (audioRef.current) audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
  };

  const skip = (s: number) => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + s));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ── render ──────────────────────────────────────────────────────── */
  const renderCard = (
    name: string,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ) => {
    const sp = speakerConfig[name];
    const isTalking = activeSpeaker === name;
    return (
      <div
        className={`pod-card ${isTalking ? 'pod-card--active' : ''}`}
        style={{ '--pod-accent': sp.accent } as React.CSSProperties}
      >
        {/* accent stripe */}
        <div className="pod-card__stripe" style={{ background: sp.accent }} />

        {/* avatar + info */}
        <div className="pod-card__header">
          <div className="pod-card__avatar" style={{ background: sp.accent }}>
            {sp.initials}
          </div>
          <div className="pod-card__info">
            <span className="pod-card__name">{name}</span>
            <span className="pod-card__role">{sp.role}</span>
          </div>
          {isTalking && <span className="pod-card__live">LIVE</span>}
        </div>

        {/* waveform */}
        <div className="pod-card__wave">
          <canvas ref={canvasRef} className="pod-card__canvas" />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="pod-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <audio
        ref={audioRef}
        src="/podcast.mp3"
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || TOTAL_DURATION)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* ── Two speaker cards ─────────────────────────────────────── */}
      <div className="pod-cards">
        {renderCard('Dr. Kalam', kalamCanvas)}
        {renderCard('iShowSpeed', speedCanvas)}
      </div>

      {/* ── Bottom player bar ─────────────────────────────────────── */}
      <div className="pod-player">
        {/* seek */}
        <div className="pod-seek" onClick={seek}>
          <div className="pod-seek__fill" style={{ width: `${progress}%` }} />
          <div className="pod-seek__thumb" style={{ left: `${progress}%` }} />
        </div>

        <div className="pod-controls">
          <div className="pod-controls__left">
            <button className="pod-btn" onClick={() => skip(-10)} title="Back 10s">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 3C7.81 3 4.02 6.42 3.15 10.8L1 9l1.5 4.5L7 12l-2.35-1.47C5.55 7.45 8.64 5 12.5 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-2.76 0-5.15-1.6-6.3-3.93l-1.82.82C5.77 18.63 8.9 21 12.5 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><text x="7" y="16" fontSize="7.5" fontWeight="bold" fill="currentColor">10</text></svg>
            </button>
            <button className="pod-btn pod-btn--play" onClick={togglePlay}>
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button className="pod-btn" onClick={() => skip(10)} title="Forward 10s">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 3c4.69 0 8.48 3.42 9.35 7.8L23 9l-1.5 4.5L17 12l2.35-1.47C18.45 7.45 15.36 5 11.5 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c2.76 0 5.15-1.6 6.3-3.93l1.82.82C18.23 18.63 15.1 21 11.5 21c-4.97 0-9-4.03-9-9s4.03-9 9-9z"/><text x="6.5" y="16" fontSize="7.5" fontWeight="bold" fill="currentColor">10</text></svg>
            </button>
          </div>

          <span className="pod-time">{fmt(currentTime)} / {fmt(duration)}</span>

          <div className="pod-controls__right">
            <button className="pod-btn" onClick={() => { if (!audioRef.current) return; setIsMuted(!isMuted); audioRef.current.muted = !isMuted; }}>
              {isMuted || volume === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              )}
            </button>
            <input
              type="range" className="pod-vol" min={0} max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                if (audioRef.current) {
                  audioRef.current.volume = v / 100;
                  if (v > 0) { setIsMuted(false); audioRef.current.muted = false; }
                }
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
