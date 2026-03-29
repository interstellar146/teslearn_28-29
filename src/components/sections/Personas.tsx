import { motion } from 'framer-motion';

const personas = [
  {
    icon: '🎒',
    name: 'Students',
    description: 'Master complex subjects with multi-modal learning. Generate study materials, mind maps, and test yourself with AI viva.',
  },
  {
    icon: '💼',
    name: 'Professionals',
    description: 'Upskill efficiently with AI-generated content. Stay ahead with concise podcasts and interactive learning.',
  },
  {
    icon: '📚',
    name: 'Educators',
    description: 'Create engaging teaching materials. Generate videos, mind maps, and interactive labs for your curriculum.',
  },
  {
    icon: '🔍',
    name: 'Curious Minds',
    description: 'Explore any topic in depth. From quantum physics to art history — learn anything, any way you prefer.',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function Personas() {
  return (
    <section className="section" id="personas">
      <div className="container">
        <div className="section-header">
          {/* <span className="section-badge">👥 For Everyone</span> */}
          <h2 className="section-title">Who It's For</h2>
          <p className="section-subtitle">
            Whether you're a student, professional, or lifelong learner — LearnSphere adapts to your needs.
          </p>
        </div>

        <motion.div
          className="grid grid--4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {personas.map((persona) => (
            <motion.div key={persona.name} variants={cardVariants}>
              <div className="persona-card" id={`persona-${persona.name.toLowerCase()}`}>
                <div className="persona-card__icon">{persona.icon}</div>
                <h3 className="persona-card__name">{persona.name}</h3>
                <p className="persona-card__description">{persona.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
