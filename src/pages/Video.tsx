import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const videosData = [
  {
    id: 'neural-network',
    title: 'Neural Networks',
    variants: [
      { id: 'en', label: 'English', url: 'https://uploadedbyclients.s3.ap-south-1.amazonaws.com/NeuralNetwork.mp4' }
    ]
  },
  {
    id: 'projectile-motion',
    title: 'Projectile Motion',
    variants: [
      { id: 'en-us', label: 'American English', url: 'https://uploadedbyclients.s3.ap-south-1.amazonaws.com/finalprojectilemotionwithintro.mp4' },
      { id: 'en-in', label: 'Indian English', url: 'https://uploadedbyclients.s3.ap-south-1.amazonaws.com/ProjectileMotionEn-IND.mp4' },
      { id: 'hi', label: 'Hindi', url: 'https://uploadedbyclients.s3.ap-south-1.amazonaws.com/ProjectileMotionHindi.mp4' }
    ]
  }
];

export default function Video() {
  const [activeVideo, setActiveVideo] = useState(videosData[0]);
  const [activeVariant, setActiveVariant] = useState(videosData[0].variants[0]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [settingsPanel, setSettingsPanel] = useState<'main' | 'speed'>('main');

  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
  }, [isPlaying, resetHideTimer]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    resetHideTimer();
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    resetHideTimer();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    resetHideTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol / 100;
      if (newVol > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      } else {
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    }
  };

  const closeMenus = () => {
    setShowSettings(false);
    setShowLangMenu(false);
    setShowTopicMenu(false);
    setSettingsPanel('main');
  };

  const handleTopicChange = (topicId: string) => {
    const topic = videosData.find((t) => t.id === topicId);
    if (topic) {
      setActiveVideo(topic);
      setActiveVariant(topic.variants[0]);
      setIsPlaying(false);
    }
    closeMenus();
  };

  const handleVariantChange = (variantId: string) => {
    const variant = activeVideo.variants.find((v) => v.id === variantId);
    if (variant) {
      const wasPlaying = isPlaying;
      setActiveVariant(variant);
      // Let the video load, then resume if it was playing
      if (wasPlaying && videoRef.current) {
        videoRef.current.play();
      }
    }
    closeMenus();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      className="yt-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={closeMenus}
    >
      {/* Video Player */}
      <div
        className="yt-player"
        ref={playerRef}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        style={{ backgroundColor: '#000' }}
      >
        {/* Video Content */}
        <div className="yt-player__content" onClick={(e) => {
          if ((e.target as HTMLElement).closest('.yt-controls, .yt-menu')) return;
          closeMenus();
          togglePlay();
        }}>
          <video
            ref={videoRef}
            src={activeVariant.url}
            className="yt-player__video"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration || 0);
              if (videoRef.current) {
                videoRef.current.playbackRate = playbackSpeed;
                videoRef.current.volume = volume / 100;
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>

        {/* Center Play/Pause overlay */}
        {showControls && (
          <div className="yt-player__center-controls">
            <button className="yt-center-btn" onClick={(e) => { e.stopPropagation(); skip(-5); }} title="Rewind 5s">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12.5 3C7.81 3 4.02 6.42 3.15 10.8L1 9l1.5 4.5L7 12l-2.35-1.47C5.55 7.45 8.64 5 12.5 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-2.76 0-5.15-1.6-6.3-3.93l-1.82.82C5.77 18.63 8.9 21 12.5 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><text x="9" y="16" fontSize="8" fill="white" fontWeight="bold">5</text></svg>
            </button>
            <button className="yt-center-btn yt-center-btn--play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button className="yt-center-btn" onClick={(e) => { e.stopPropagation(); skip(5); }} title="Forward 5s">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M11.5 3c4.69 0 8.48 3.42 9.35 7.8L23 9l-1.5 4.5L17 12l2.35-1.47C18.45 7.45 15.36 5 11.5 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c2.76 0 5.15-1.6 6.3-3.93l1.82.82C18.23 18.63 15.1 21 11.5 21c-4.97 0-9-4.03-9-9s4.03-9 9-9z"/><text x="8.5" y="16" fontSize="8" fill="white" fontWeight="bold">5</text></svg>
            </button>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div className={`yt-controls ${showControls ? 'yt-controls--visible' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Progress Bar */}
          <div className="yt-progress" ref={progressRef} onClick={handleProgressClick}>
            <div className="yt-progress__fill" style={{ width: `${progress}%` }} />
            <div className="yt-progress__thumb" style={{ left: `${progress}%` }} />
          </div>

          <div className="yt-controls__row">
            {/* Left controls */}
            <div className="yt-controls__left">
              <button className="yt-ctrl-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button className="yt-ctrl-btn" onClick={() => skip(-5)} title="Rewind 5 seconds">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.5 3C7.81 3 4.02 6.42 3.15 10.8L1 9l1.5 4.5L7 12l-2.35-1.47C5.55 7.45 8.64 5 12.5 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-2.76 0-5.15-1.6-6.3-3.93l-1.82.82C5.77 18.63 8.9 21 12.5 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><text x="9" y="16" fontSize="8" fill="white" fontWeight="bold">5</text></svg>
              </button>
              <button className="yt-ctrl-btn" onClick={() => skip(5)} title="Forward 5 seconds">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.5 3c4.69 0 8.48 3.42 9.35 7.8L23 9l-1.5 4.5L17 12l2.35-1.47C18.45 7.45 15.36 5 11.5 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c2.76 0 5.15-1.6 6.3-3.93l1.82.82C18.23 18.63 15.1 21 11.5 21c-4.97 0-9-4.03-9-9s4.03-9 9-9z"/><text x="8.5" y="16" fontSize="8" fill="white" fontWeight="bold">5</text></svg>
              </button>

              {/* Volume */}
              <div className="yt-volume">
                <button className="yt-ctrl-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || volume === 0 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  )}
                </button>
                <input
                  type="range"
                  className="yt-volume__slider"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                />
              </div>

              <span className="yt-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            {/* Right controls */}
            <div className="yt-controls__right">
              {/* Language Variant Picker */}
              <div className="yt-menu-wrapper">
                <button
                  className="yt-ctrl-btn"
                  onClick={(e) => { e.stopPropagation(); setShowLangMenu((v) => !v); setShowSettings(false); }}
                  title="Language"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
                </button>
                {showLangMenu && (
                  <div className="yt-menu" onClick={(e) => e.stopPropagation()}>
                    <div className="yt-menu__title">Audio Track</div>
                    {activeVideo.variants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`yt-menu__item ${activeVariant.id === variant.id ? 'yt-menu__item--active' : ''}`}
                        onClick={() => handleVariantChange(variant.id)}
                      >
                        <span>{variant.label}</span>
                        {activeVariant.id === variant.id && <span className="yt-menu__check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="yt-menu-wrapper">
                <button
                  className="yt-ctrl-btn"
                  onClick={(e) => { e.stopPropagation(); setShowSettings((v) => !v); setShowLangMenu(false); setSettingsPanel('main'); }}
                  title="Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58-1.97-3.4-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.8 4h-3.6l-.38 2.1c-.59.24-1.13.56-1.62.94L6.81 6.08l-1.97 3.4 2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58 1.97 3.4 2.39-.96c.5.38 1.03.7 1.62.94l.38 2.1h3.6l.38-2.1c.59-.24 1.13-.56 1.62-.94l2.39.96 1.97-3.4-2.03-1.58zM13 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                </button>
                {showSettings && (
                  <div className="yt-menu yt-menu--settings" onClick={(e) => e.stopPropagation()}>
                    {settingsPanel === 'main' && (
                      <button className="yt-menu__item yt-menu__item--row" onClick={() => setSettingsPanel('speed')}>
                        <span>Playback speed</span>
                        <span className="yt-menu__value">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`} ›</span>
                      </button>
                    )}
                    {settingsPanel === 'speed' && (
                      <>
                        <button className="yt-menu__back" onClick={() => setSettingsPanel('main')}>‹ Playback speed</button>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                          <button
                            key={s}
                            className={`yt-menu__item ${playbackSpeed === s ? 'yt-menu__item--active' : ''}`}
                            onClick={() => {
                              setPlaybackSpeed(s);
                              if (videoRef.current) videoRef.current.playbackRate = s;
                              setSettingsPanel('main');
                            }}
                          >
                            <span>{s === 1 ? 'Normal' : `${s}x`}</span>
                            {playbackSpeed === s && <span className="yt-menu__check">✓</span>}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button className="yt-ctrl-btn" onClick={toggleFullscreen} title="Fullscreen">
                {isFullscreen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gradient overlay bottom */}
        <div className={`yt-player__gradient ${showControls ? 'yt-player__gradient--visible' : ''}`} />
      </div>

      {/* Video Info below player */}
      <div className="yt-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="yt-info__title">{activeVideo.title}</h1>
          <div className="yt-info__meta">
            <span className="yt-info__views">Playing: {activeVariant.label} Track</span>
            <span className="yt-info__dot">•</span>
            <span className="yt-info__date">LearnSphere AI Integration</span>
          </div>
          <div className="yt-info__channel" style={{ marginTop: '1.5rem' }}>
            <div className="yt-info__avatar">LS</div>
            <div>
              <div className="yt-info__channel-name">LearnSphere Engine</div>
              <div className="yt-info__subs">Generated Educational Content</div>
            </div>
          </div>
        </div>

        {/* Topic Selector Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTopicMenu(!showTopicMenu); }}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s'
            }}
          >
            Switch Topic
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          
          {showTopicMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              width: '240px',
              zIndex: 100,
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }} onClick={(e) => e.stopPropagation()}>
              {videosData.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicChange(topic.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    backgroundColor: activeVideo.id === topic.id ? '#fdf0df' : 'transparent',
                    borderLeft: `4px solid ${activeVideo.id === topic.id ? '#ce5522' : 'transparent'}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = activeVideo.id === topic.id ? '#fdf0df' : '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = activeVideo.id === topic.id ? '#fdf0df' : 'transparent'}
                >
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                    {topic.variants.length} Audio Tracks
                  </span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {topic.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
