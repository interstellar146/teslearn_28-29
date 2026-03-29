import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants & Types ---
const AI_WAVEFORM_SIZE = 48;
const USER_WAVEFORM_SIZE = 32;

export default function Viva() {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // Audio waveforms
  const [userBars, setUserBars] = useState<number[]>(new Array(USER_WAVEFORM_SIZE).fill(0.1));
  const [aiBars, setAiBars] = useState<number[]>(new Array(AI_WAVEFORM_SIZE).fill(0.15));
  
  // Refs for Audio API & Streams
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const systemAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const systemStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- Dual Stream Analysis Logic ---
  const startAudioAnalysis = async (): Promise<boolean> => {
    try {
      // 1. Get Microphone stream
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (micStream.getAudioTracks().length === 0) {
        throw new Error('No microphone audio track found');
      }
      micStreamRef.current = micStream;

      // 2. Get System Audio (Speaker) stream via Screen Capture
      const systemStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // CRITICAL: Check if user actually checked the "Share audio" box in the popup
      if (systemStream.getAudioTracks().length === 0) {
        alert("Audio capture was not enabled. Please make sure to check the 'Share audio' box in the screen-share popup.");
        systemStream.getTracks().forEach(t => t.stop());
        micStream.getTracks().forEach(t => t.stop());
        return false;
      }
      
      systemStreamRef.current = systemStream;

      // Handle user stopping share via browser bar
      systemStream.getVideoTracks()[0].onended = () => {
        handleStopSession();
      };

      // Initialize Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Setup Mic Analyser
      const micSource = ctx.createMediaStreamSource(micStream);
      const micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 128;
      micAnalyserRef.current = micAnalyser;
      micSource.connect(micAnalyser);

      // Setup System Audio Analyser
      const systemSource = ctx.createMediaStreamSource(systemStream);
      const systemAnalyser = ctx.createAnalyser();
      systemAnalyser.fftSize = 256;
      systemAnalyserRef.current = systemAnalyser;
      systemSource.connect(systemAnalyser);

      const micData = new Uint8Array(micAnalyser.frequencyBinCount);
      const systemData = new Uint8Array(systemAnalyser.frequencyBinCount);

      const update = () => {
        if (!micAnalyserRef.current || !systemAnalyserRef.current) return;
        
        micAnalyserRef.current.getByteFrequencyData(micData);
        systemAnalyserRef.current.getByteFrequencyData(systemData);

        // Process User Bars
        const newUserBars = [];
        const micStep = Math.floor(micData.length / USER_WAVEFORM_SIZE);
        for (let i = 0; i < USER_WAVEFORM_SIZE; i++) {
          newUserBars.push(Math.max(0.1, micData[i * micStep] / 255.0));
        }
        setUserBars(newUserBars);

        // Process AI Bars
        const newAiBars = [];
        const systemStep = Math.floor(systemData.length / AI_WAVEFORM_SIZE);
        let hasSignal = false;
        for (let i = 0; i < AI_WAVEFORM_SIZE; i++) {
          const val = systemData[i * systemStep] / 255.0;
          if (val > 0.05) hasSignal = true;
          newAiBars.push(Math.max(0.15, val));
        }
        setAiBars(newAiBars);
        setIsAISpeaking(hasSignal);

        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
      return true;
    } catch (err) {
      console.error('Permission denied or capture error:', err);
      stopStreams(); // Cleanup partial streams
      return false;
    }
  };

  const stopStreams = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    [micStreamRef, systemStreamRef].forEach(ref => {
      if (ref.current) {
        ref.current.getTracks().forEach(t => t.stop());
        ref.current = null;
      }
    });

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    
    setUserBars(new Array(USER_WAVEFORM_SIZE).fill(0.1));
    setAiBars(new Array(AI_WAVEFORM_SIZE).fill(0.15));
    setIsAISpeaking(false);
  };

  const handleStopSession = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/viva/stop', { method: 'POST' });
    } catch (err) {
      console.warn('Backend stop call failed:', err);
    }
    setIsRecording(false);
    stopStreams();
  };

  const handleToggleSession = async () => {
    if (isInitializing) return; // Prevent double clicks during popups

    try {
      if (isRecording) {
        await handleStopSession();
      } else {
        setIsInitializing(true);
        const success = await startAudioAnalysis();
        
        if (success) {
          try {
            await fetch('http://localhost:8000/api/v1/viva/start', { method: 'POST' });
            setIsRecording(true);
          } catch (err) {
            console.error('Backend start failed:', err);
            stopStreams();
          }
        }
        setIsInitializing(false);
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setIsInitializing(false);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => stopStreams();
  }, []);

  return (
    <motion.div
      className="viva-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="viva-header" style={{ marginBottom: '2rem' }}>
        <div className="viva-header__info">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Viva Examination</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRecording 
              ? "Live Capture: Syncing Mic & Speaker audio." 
              : "Click 'Start Viva' to begin and grant audio permissions."}
          </p>
        </div>
        <div className="viva-header__status">
          <AnimatePresence>
            {isAISpeaking && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="viva-header__live"
              >
                <span className="viva-header__live-dot" /> AI Speaking
              </motion.span>
            )}
          </AnimatePresence>
          {isRecording && (
            <span className="viva-header__live viva-header__live--rec">
              <span className="viva-header__live-dot viva-header__live-dot--rec" /> Live
            </span>
          )}
        </div>
      </div>

      <div className="viva-grid viva-grid--two">
        {/* AI Examiner Card */}
        <div className={`viva-card viva-card--ai ${isAISpeaking ? 'viva-card--active' : ''}`}>
          <div className="viva-card__header">
            <div className="viva-card__avatar viva-card__avatar--ai">🤖</div>
            <div className="viva-card__name-wrap">
              <span className="viva-card__name">AI Examiner</span>
              <span className="viva-card__role">System Speaker Audio</span>
            </div>
          </div>

          <div className="viva-card__waveform">
            {aiBars.map((h, i) => (
              <div
                className={`viva-waveform-bar ${isAISpeaking ? 'viva-waveform-bar--active' : ''}`}
                key={i}
                style={{
                  height: `${h * 100}%`,
                  transition: 'height 80ms ease-out',
                  opacity: h > 0.16 ? 1 : 0.3,
                  background: h > 0.16 ? 'var(--olive)' : '#e2e8f0'
                }}
              />
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 text-slate-500 text-[11px] text-center">
            {isRecording 
              ? (isAISpeaking ? "AI is speaking..." : "Analyzing system output...") 
              : "Awaiting audio stream..."}
          </div>
        </div>

        {/* User Card */}
        <div className={`viva-card viva-card--user ${isRecording && !isAISpeaking ? 'viva-card--active' : ''}`}>
          <div className="viva-card__header">
            <div className="viva-card__avatar viva-card__avatar--user">👤</div>
            <div className="viva-card__name-wrap">
              <span className="viva-card__name">You</span>
              <span className="viva-card__role">Microphone Input</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100/50 mb-6">
            <motion.button
              disabled={isInitializing}
              whileHover={isInitializing ? {} : { scale: 1.05 }}
              whileTap={isInitializing ? {} : { scale: 0.95 }}
              className={`viva-mic ${isRecording ? 'viva-mic--recording' : ''} ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleToggleSession}
            >
              <AnimatePresence mode="wait">
                {isInitializing ? (
                  <motion.div
                    key="init"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"
                  />
                ) : (
                  <motion.svg 
                    key="mic"
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    width="32" height="32" viewBox="0 0 24 24" fill="white"
                  >
                    {isRecording ? (
                      <rect x="6" y="6" width="12" height="12" />
                    ) : (
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    )}
                  </motion.svg>
                )}
              </AnimatePresence>
              {isRecording && <span className="viva-mic__pulse" />}
            </motion.button>
            <span className="viva-card__mic-label mt-5 font-bold text-slate-800 tracking-tight text-sm">
              {isInitializing ? 'INITIALIZING...' : (isRecording ? 'STOP SESSION' : 'START VIVA')}
            </span>
          </div>

          <div className="viva-card__waveform viva-card__waveform--user">
            {userBars.map((h, i) => (
              <div
                className="viva-waveform-bar viva-waveform-bar--user viva-waveform-bar--active"
                key={i}
                style={{
                  height: `${h * 100}%`,
                  transition: 'height 40ms ease-out',
                  opacity: isRecording ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
