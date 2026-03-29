import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <motion.div
          className="hero__content hero__content--centered"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* <div className="hero__badge">
            ✨ AI-Powered Learning Platform
          </div> */}
          <h1 className="hero__title">
            Learn Smarter with{' '}
            <span className="hero__title-accent">AI</span>
          </h1>
          <p className="hero__subtitle">
            A unified platform for multi-modal learning. Master any topic through videos,
            podcasts, mind maps, virtual labs, and conversational AI — all in one place.
          </p>
          <div className="hero__actions">
            <Link to="/screenreader" className="btn btn--primary btn--lg" id="hero-cta-primary">
              Start Learning
            </Link>
            <a href="#products" className="btn btn--secondary btn--lg" id="hero-cta-secondary">
              Explore Tools
            </a>
          </div>
          <div className="hero__stats">
            <div>
              <div className="hero__stat-value">6+</div>
              <div className="hero__stat-label">AI Tools</div>
            </div>
            <div>
              <div className="hero__stat-value">Multi</div>
              <div className="hero__stat-label">Modal Learning</div>
            </div>
            <div>
              <div className="hero__stat-value">∞</div>
              <div className="hero__stat-label">Topics</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
