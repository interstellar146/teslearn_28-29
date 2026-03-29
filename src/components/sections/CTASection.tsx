import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="cta-section" id="cta">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="cta-section__title">Start Your Learning Journey</h2>
          <p className="cta-section__subtitle">
            Join thousands of learners using AI to master new topics faster than ever before.
          </p>
          <Link to="/assistant" className="btn btn--inverse btn--lg" id="cta-get-started">
            Get Started Free →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
