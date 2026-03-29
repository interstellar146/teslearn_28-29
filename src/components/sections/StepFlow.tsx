import { motion } from 'framer-motion';

const steps = [
  {
    number: 1,
    title: 'Choose Your Topic',
    description: 'Type any subject, concept, or question you want to explore. Our AI understands context and adapts to your level.',
  },
  {
    number: 2,
    title: 'Pick Your Mode',
    description: 'Select how you want to learn — watch a video, listen to a podcast, explore a mind map, or chat with the assistant.',
  },
  {
    number: 3,
    title: 'Learn & Interact',
    description: 'Engage with AI-generated content. Ask follow-up questions, take notes, and build deeper understanding.',
  },
  {
    number: 4,
    title: 'Test & Retain',
    description: 'Use AI Viva to test your knowledge. Get personalized feedback and reinforce what you\'ve learned.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function StepFlow() {
  return (
    <section className="hiw-section" id="how">
      <div className="hiw-container">

        <motion.div
          className="hiw-header text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* <span className="section-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>🔄 Process</span> */}
          <h2 className="hiw-title">How It Works</h2>
          <p className="hiw-subtitle">
            From curiosity to mastery in four simple steps.
          </p>
        </motion.div>

        <motion.div
          className="hiw-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Graphical Shapes & Text Columns */}
          <div className="hiw-graphics-row">
            {/* Step 1 */}
            <motion.div className="hiw-step-col" variants={itemVariants}>
              <div className="hiw-shape hiw-shape--left">
                <h4 className="hiw-step-label">Step: {steps[0].number}</h4>
                <h3 className="hiw-step-heading">{steps[0].title}</h3>
              </div>
              <div className="hiw-desc">{steps[0].description}</div>
            </motion.div>

            {/* Twist 1 (Up) */}
            <div className="hiw-twist">
              <svg viewBox="0 0 100 160" preserveAspectRatio="none">
                <path d="M-20,135 C40,135 60,25 120,25" stroke="#ce5522" strokeWidth="18" fill="none" />
                <path d="M30,80 C50,45 60,25 120,25" stroke="#a3360b" strokeWidth="18" fill="none" opacity="0.5" />
              </svg>
            </div>

            {/* Step 2 */}
            <motion.div className="hiw-step-col" variants={itemVariants}>
              <div className="hiw-shape hiw-shape--center">
                <h4 className="hiw-step-label">Step: {steps[1].number}</h4>
                <h3 className="hiw-step-heading">{steps[1].title}</h3>
              </div>
              <div className="hiw-desc">{steps[1].description}</div>
            </motion.div>

            {/* Twist 2 (Down) */}
            <div className="hiw-twist">
              <svg viewBox="0 0 100 160" preserveAspectRatio="none">
                <path d="M-20,25 C40,25 60,135 120,135" stroke="#ce5522" strokeWidth="18" fill="none" />
                <path d="M30,80 C50,115 60,135 120,135" stroke="#a3360b" strokeWidth="18" fill="none" opacity="0.5" />
              </svg>
            </div>

            {/* Step 3 */}
            <motion.div className="hiw-step-col" variants={itemVariants}>
              <div className="hiw-shape hiw-shape--center">
                <h4 className="hiw-step-label">Step: {steps[2].number}</h4>
                <h3 className="hiw-step-heading">{steps[2].title}</h3>
              </div>
              <div className="hiw-desc">{steps[2].description}</div>
            </motion.div>

            {/* Twist 3 (Up) */}
            <div className="hiw-twist">
              <svg viewBox="0 0 100 160" preserveAspectRatio="none">
                <path d="M-20,135 C40,135 60,25 120,25" stroke="#ce5522" strokeWidth="18" fill="none" />
                <path d="M30,80 C50,45 60,25 120,25" stroke="#a3360b" strokeWidth="18" fill="none" opacity="0.5" />
              </svg>
            </div>

            {/* Step 4 */}
            <motion.div className="hiw-step-col" variants={itemVariants}>
              <div className="hiw-shape hiw-shape--right">
                <h4 className="hiw-step-label">Step: {steps[3].number}</h4>
                <h3 className="hiw-step-heading">{steps[3].title}</h3>
              </div>
              <div className="hiw-desc">{steps[3].description}</div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
