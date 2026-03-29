import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Message } from '../store/useAppStore';

const generateWaveform = () =>
  Array.from({ length: 48 }, () => Math.random() * 0.8 + 0.2);

export default function Viva() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [waveform, setWaveform] = useState(generateWaveform);
  const [currentQuestion, setCurrentQuestion] = useState(
    'Explain the concept of polymorphism in Object-Oriented Programming.'
  );
  const [questionIndex, setQuestionIndex] = useState(0);

  const { chatHistory, addMessage } = useAppStore();
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = [
    'Explain the concept of polymorphism in Object-Oriented Programming.',
    'What is the difference between a stack and a queue?',
    'How does garbage collection work in Java?',
    'Describe the SOLID principles in software design.',
    'What is the time complexity of binary search?',
  ];

  useEffect(() => {
    if (!isAISpeaking) return;
    const interval = setInterval(() => setWaveform(generateWaveform()), 150);
    return () => clearInterval(interval);
  }, [isAISpeaking]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [chatHistory, scrollToBottom]);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setTimeout(() => {
        setIsAISpeaking(true);
        setTimeout(() => {
          setIsAISpeaking(false);
          const next = (questionIndex + 1) % questions.length;
          setQuestionIndex(next);
          setCurrentQuestion(questions[next]);
        }, 3000);
      }, 500);
    } else {
      setIsRecording(true);
    }
  };

  const handleChatSend = (text?: string) => {
    const message = text || chatInput.trim();
    if (!message) return;
    addMessage({ role: 'user', content: message });
    setChatInput('');
    setTimeout(() => {
      addMessage({
        role: 'ai',
        content:
          "Great question! In the context of your viva, this relates to core concepts you should understand deeply. Let me explain — polymorphism means 'many forms'. In OOP, it allows objects of different classes to be treated as objects of a common superclass. Focus on giving clear, structured answers with examples like method overriding and method overloading.",
      });
    }, 800);
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <motion.div
      className="viva-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="viva-header">
        <div className="viva-header__info">
          <span className="viva-header__badge">🎓 AI Viva Session</span>
          <h2 className="viva-header__topic">Object-Oriented Programming</h2>
        </div>
        <div className="viva-header__status">
          {isAISpeaking && (
            <span className="viva-header__live">
              <span className="viva-header__live-dot" /> AI Speaking
            </span>
          )}
          {isRecording && (
            <span className="viva-header__live viva-header__live--rec">
              <span className="viva-header__live-dot viva-header__live-dot--rec" /> Recording
            </span>
          )}
        </div>
      </div>

      {/* 3-column symmetric grid */}
      <div className={`viva-grid ${showAssistant ? 'viva-grid--three' : 'viva-grid--two'}`}>

        {/* ── AI Examiner Card ── */}
        <div className={`viva-card viva-card--ai ${isAISpeaking ? 'viva-card--active' : ''}`}>
          <div className="viva-card__header">
            <div className="viva-card__avatar viva-card__avatar--ai">🤖</div>
            <div className="viva-card__name-wrap">
              <span className="viva-card__name">AI Examiner</span>
              <span className="viva-card__role">LearnSphere AI</span>
            </div>
            <button
              className={`viva-card__assistant-btn ${showAssistant ? 'viva-card__assistant-btn--active' : ''}`}
              onClick={() => setShowAssistant((v) => !v)}
              title="Toggle AI Assistant"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
              {showAssistant ? 'Close' : 'Assistant'}
            </button>
          </div>

          {/* Waveform */}
          <div className="viva-card__waveform">
            {waveform.map((h, i) => (
              <div
                className={`viva-waveform-bar ${isAISpeaking ? 'viva-waveform-bar--active' : ''}`}
                key={i}
                style={{
                  height: `${isAISpeaking ? h * 100 : 30}%`,
                  transitionDelay: `${i * 8}ms`,
                }}
              />
            ))}
          </div>

          {/* Question */}
          <div className="viva-card__question">
            <span className="viva-card__question-label">Current Question</span>
            <p className="viva-card__question-text">{currentQuestion}</p>
          </div>
        </div>

        {/* ── User Card ── */}
        <div className={`viva-card viva-card--user ${isRecording ? 'viva-card--active' : ''}`}>
          <div className="viva-card__header">
            <div className="viva-card__avatar viva-card__avatar--user">👤</div>
            <div className="viva-card__name-wrap">
              <span className="viva-card__name">You</span>
              <span className="viva-card__role">Student</span>
            </div>
          </div>

          <div className="viva-card__mic-area">
            <button
              className={`viva-mic ${isRecording ? 'viva-mic--recording' : ''}`}
              onClick={handleRecord}
              disabled={isAISpeaking}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              {isRecording && <span className="viva-mic__pulse" />}
            </button>
            <span className="viva-card__mic-label">
              {isAISpeaking
                ? 'Wait for the AI to finish...'
                : isRecording
                ? 'Listening... Click to stop'
                : 'Click to start answering'}
            </span>
          </div>

          {isRecording && (
            <div className="viva-card__waveform viva-card__waveform--user">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  className="viva-waveform-bar viva-waveform-bar--user viva-waveform-bar--active"
                  key={i}
                  style={{
                    height: `${(Math.random() * 0.7 + 0.3) * 100}%`,
                    animationDelay: `${i * 30}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Assistant Panel (third column) ── */}
        <AnimatePresence>
          {showAssistant && (
            <motion.div
              className="viva-card viva-card--assistant"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              {/* Assistant Header */}
              <div className="viva-assistant__header">
                <div className="viva-assistant__header-left">
                  <span className="viva-assistant__icon">🧠</span>
                  <span className="viva-assistant__title">AI Assistant</span>
                </div>
                <button className="viva-assistant__close" onClick={() => setShowAssistant(false)}>✕</button>
              </div>

              {/* Messages */}
              <div className="viva-assistant__messages">
                {chatHistory.length === 0 ? (
                  <div className="viva-assistant__empty">
                    <div className="viva-assistant__empty-icon">💬</div>
                    <p className="viva-assistant__empty-title">Need help?</p>
                    <p className="viva-assistant__empty-text">
                      Ask the assistant about the current topic being examined.
                    </p>
                    <div className="viva-assistant__suggestions">
                      {[
                        'Explain polymorphism simply',
                        'Give me an example',
                        'Key points to mention',
                      ].map((s) => (
                        <button
                          key={s}
                          className="viva-assistant__suggestion"
                          onClick={() => handleChatSend(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="viva-assistant__chat-list">
                    {chatHistory.map((msg: Message) => (
                      <motion.div
                        key={msg.id}
                        className={`viva-chat-bubble viva-chat-bubble--${msg.role}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="viva-chat-bubble__avatar">
                          {msg.role === 'user' ? '👤' : '🧠'}
                        </div>
                        <div className="viva-chat-bubble__body">
                          <span className="viva-chat-bubble__name">
                            {msg.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          <p className="viva-chat-bubble__text">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="viva-assistant__input-area">
                <input
                  className="viva-assistant__input"
                  type="text"
                  placeholder="Ask for help..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                />
                <button
                  className="viva-assistant__send"
                  onClick={() => handleChatSend()}
                  disabled={!chatInput.trim()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
