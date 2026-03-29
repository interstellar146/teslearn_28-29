import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Message } from '../store/useAppStore';

const features = [
  {
    title: 'Text-to-Speech',
    desc: 'Instantly convert any selected text or study material into natural-sounding audio.',
    icon: '🗣️'
  },
  {
    title: 'Adjustable Speed',
    desc: 'Control the reading pace to match your comfortable listening and comprehension speed.',
    icon: '⚡'
  },
  {
    title: 'Word Highlighting',
    desc: 'Follow along visually as words are highlighted synchronously while they are being read.',
    icon: '🖍️'
  },
  {
    title: 'Multi-Language',
    desc: 'Support for multiple languages and accents to assist with language learning.',
    icon: '🌍'
  }
];

const aiResponses: Record<string, string> = {
  default:
    "That's a great question! I'd be happy to help you learn about this topic. In a full implementation, I would connect to an AI backend to provide detailed, contextual responses. For now, I'm here as a preview of your learning assistant experience. Try asking me about any topic!",
};

export default function ScreenReader() {
  const { chatHistory, addMessage } = useAppStore();
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    addMessage({ role: 'user', content: message });
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        role: 'ai',
        content: aiResponses.default,
      });
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container" style={{ position: 'relative', height: 'calc(100vh - var(--navbar-height) - 2rem)', overflow: 'hidden' }}>
      
      <div className="chat-messages" style={{ padding: 0 }}>
        {chatHistory.length === 0 ? (
          <div style={{ padding: '1rem 3rem' }}>
            <div className="screenreader-header" style={{ marginBottom: '1.5rem' }}>
              <h2>AI Screen Reader & Assistant</h2>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
                Enhance your learning experience by listening to your study materials and asking questions.
              </p>
            </div>

            <div className="screenreader-features" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem'
            }}>
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--olive)' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {chatHistory.map((msg: Message) => (
                <motion.div
                  key={msg.id}
                  className={`chat-message chat-message--${msg.role}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="chat-message__role">
                    {msg.role === 'user' ? 'You' : 'LearnSphere AI'}
                  </div>
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed bottom input area */}
      <div className="chat-input-area" style={{ background: 'var(--cream)', borderTop: 'none', padding: '1rem 4rem 1rem 3rem' }}>
        <div className="chat-input-wrapper" style={{ paddingRight: '4rem' }}>
          <input
            className="chat-input"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="chat-input"
            style={{ borderRadius: '9999px', backgroundColor: 'var(--card-bg)' }}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            id="chat-send"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="screenreader-fab"
        onClick={() => setIsActive(!isActive)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '2rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: isActive ? '#ef4444' : 'var(--orange)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'background-color 0.3s'
        }}
        title={isActive ? 'Stop Reader' : 'Start Reader'}
      >
        {isActive ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        )}
      </motion.button>

    </div>
  );
}
