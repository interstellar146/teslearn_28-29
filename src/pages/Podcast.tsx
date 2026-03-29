import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ── Speaker Durations ──────────────────────────────────────────────── */
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

/* ── Speaker Component ─────────────────────────────────────────────── */
function SpeakerAvatar({
  name,
  image,
  isTalking,
  analyser
}: {
  name: string;
  image: string;
  isTalking: boolean;
  analyser: AnalyserNode | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      if (!canvasRef.current || !analyser) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buffer);

      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const baseRadius = 80;

      ctx.clearRect(0, 0, w, h);

      if (isTalking) {
        ctx.beginPath();
        for (let i = 0; i < 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          const val = buffer[i * 2] / 255;
          const r = baseRadius + (val * 40);
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#E8651A';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Soft glow behind
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 101, 26, 0.1)';
        ctx.fill();
      } else {
        // Subtle resting circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [isTalking, analyser]);

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="absolute inset-0 z-0"
        />
        <motion.div
          animate={{ scale: 1 }}
          className="relative z-10 w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl"
        >
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-grayscale duration-500 ${!isTalking ? 'grayscale opacity-80' : 'grayscale-0'}`}
          />
        </motion.div>
      </div>
      <div className="text-center">
        <h3 className={`text-lg font-bold transition-colors ${isTalking ? 'text-[#E8651A]' : 'text-slate-500'}`}>
          {name}
        </h3>
        <p className="text-xs text-slate-400 capitalize">{isTalking ? 'Speaking...' : 'Listening'}</p>
      </div>
    </div>
  );
}

export default function Podcast() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(TOTAL_DURATION);
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [volume, setVolume] = useState(1);

  const fmt = (s: number) => {
    if (isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const turn = durationMap.find((t) => currentTime >= t.from && currentTime < t.to);
    setActiveSpeaker(turn?.speaker || '');
  }, [currentTime]);

  const initAudio = useCallback(() => {
    if (analyserRef.current || !audioRef.current) return;
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    an.fftSize = 256;
    const src = ctx.createMediaElementSource(audioRef.current);
    src.connect(an);
    an.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = an;
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    initAudio();
    if (audioRef.current.paused) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const skip = (s: number) => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + s));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-8">
      <audio
        ref={audioRef}
        src="/podcast.mp3"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || TOTAL_DURATION)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <header className="text-center">
        <h2 className="text-xs font-black text-slate-900 tracking-tight">A. P. J. Abdul Kalam x IShowSpeed on Projectile Motion</h2>
      </header>

      {/* ── Main Stage ───────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center items-center gap-12 w-full max-w-5xl">
        <SpeakerAvatar
          name="Dr. Kalam"
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/A._P._J._Abdul_Kalam_in_2008.jpg/960px-A._P._J._Abdul_Kalam_in_2008.jpg"
          isTalking={activeSpeaker === 'Dr. Kalam'}
          analyser={analyserRef.current}
        />
        <SpeakerAvatar
          name="iShowSpeed"
          image="https://i.redd.it/guys-hes-hitting-the-speed-face-im-losing-it-v0-hbqe4yg6eu1g1.jpg?width=1958&format=pjpg&auto=webp&s=504e5d6ab724317c22646070290d29683daf7361"
          isTalking={activeSpeaker === 'iShowSpeed'}
          analyser={analyserRef.current}
        />
      </div>

      {/* ── Control Bar ─────────────────────────────────────────── */}
      <div className="w-full max-w-3xl rounded-2xl p-4 space-y-3">
        {/* Progress */}
        <div className="group relative h-2 bg-slate-100 rounded-full cursor-pointer overflow-hidden"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            if (audioRef.current) audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#E8651A] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          {/* Left: Duration */}
          <div className="flex-1">
            <span className="text-sm font-mono font-medium text-slate-600">
              {fmt(currentTime)} <span className="text-slate-300 mx-1">/</span> {fmt(duration)}
            </span>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => skip(-10)}
              className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-[#E8651A] rounded-full flex items-center justify-center text-white hover:bg-[#D05A15] transition-all shadow-lg shadow-orange-100"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => skip(10)}
              className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
              </svg>
            </button>
          </div>

          {/* Right: Volume Slider */}
          <div className="flex items-center justify-end gap-3 flex-1 min-w-[128px]">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <input
              type="range"
              min={0} max={100}
              value={volume * 100}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-32 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#E8651A]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
