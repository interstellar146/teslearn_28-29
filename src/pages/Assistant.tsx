import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Message } from '../store/useAppStore';

const suggestions = [
  'Explain quantum computing simply',
  'How does photosynthesis work?',
  'Teach me about machine learning',
  'What is the theory of relativity?',
];

const aiResponses: Record<string, string> = {
  default:
    "That's a great question! I'd be happy to help you learn about this topic. In a full implementation, I would connect to an AI backend to provide detailed, contextual responses. For now, I'm here as a preview of your learning assistant experience. Try asking me about any topic!",
};

export default function Assistant() {
  const { chatHistory, addMessage } = useAppStore();
  const [input, setInput] = useState('');
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
    <div className="chat-container">
      {chatHistory.length === 0 ? (
        <div className="chat-welcome">
          <div className="chat-welcome__icon">🧠</div>
          <h2 className="chat-welcome__title">Hi, ready to learn?</h2>
          <p className="chat-welcome__subtitle">
            Ask me anything about any topic. I'll help you understand it through
            conversation, explanations, and examples.
          </p>
          <div className="chat-suggestions">
            {suggestions.map((s) => (
              <button
                key={s}
                className="chat-suggestion"
                onClick={() => handleSend(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-messages">
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

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            className="chat-input"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="chat-input"
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
    </div>
  );
}
