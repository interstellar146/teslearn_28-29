import { useState } from 'react';
import { motion } from 'framer-motion';

const virtualLabs = [
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    category: 'Computer Science',
    url: 'https://tes-learn-virtual-lab.vercel.app/neuralnetworks'
  },
  {
    id: 'projectile-motion',
    title: 'Projectile Motion',
    category: 'Physics',
    url: 'https://tes-learn-virtual-lab.vercel.app/projectile-motion'
  }
];

export default function Lab() {
  const [activeLab, setActiveLab] = useState(virtualLabs[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.div
      className="mindmap-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mindmap-header">
        <div className="mindmap-header__title-group">
          <span className="mindmap-header__icon">🔬</span>
          <div className="mindmap-header__details">
            <span className="mindmap-header__label">Interactive Virtual Lab</span>
            <h2 className="mindmap-header__title">{activeLab.title}</h2>
          </div>
        </div>

        <div className="mindmap-selector">
          <button 
            className="mindmap-selector__btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>Switch Experiment</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="mindmap-selector__menu">
              {virtualLabs.map((lab) => (
                <button
                  key={lab.id}
                  className={`mindmap-selector__item ${activeLab.id === lab.id ? 'mindmap-selector__item--active' : ''}`}
                  onClick={() => {
                    setActiveLab(lab);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="mindmap-selector__item-category">{lab.category}</span>
                  <span className="mindmap-selector__item-title">{lab.title}</span>
                  {activeLab.id === lab.id && (
                    <svg className="mindmap-selector__item-check" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mindmap-container">
        <iframe
          src={activeLab.url}
          className="mindmap-iframe"
          title={`Virtual Lab: ${activeLab.title}`}
          allowFullScreen
        ></iframe>
      </div>
    </motion.div>
  );
}
