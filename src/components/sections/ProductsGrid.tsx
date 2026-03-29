import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Product {
  icon: string;
  title: string;
  description: string;
  category: string;
  accentColor: string;
  route: string;
}

const products: Product[] = [
  {
    icon: '💬',
    title: 'AI Assistant',
    description: 'Have intelligent conversations about any topic. Get explanations, summaries, and deep insights powered by AI.',
    category: 'Conversational',
    accentColor: '#E8651A',
    route: '/assistant',
  },
  {
    icon: '🎬',
    title: 'AI Videos',
    description: 'Generate educational videos on any subject. Visual learning made effortless with AI-powered content creation.',
    category: 'Visual',
    accentColor: '#3A5232',
    route: '/video',
  },
  {
    icon: '🎙',
    title: 'AI Podcasts',
    description: 'Listen to AI-generated podcast episodes. Learn on the go with auditory content tailored to your interests.',
    category: 'Auditory',
    accentColor: '#8B5E3C',
    route: '/podcast',
  },
  {
    icon: '🗺️',
    title: 'Mind Maps',
    description: 'Visualize concepts spatially. Create interactive mind maps that help you see connections between ideas.',
    category: 'Spatial',
    accentColor: '#4A6741',
    route: '/mindmap',
  },
  {
    icon: '🔬',
    title: 'Virtual Lab',
    description: 'Experiment in a safe virtual environment. Practice concepts hands-on with interactive simulations.',
    category: 'Experiential',
    accentColor: '#6B4C8B',
    route: '/lab',
  },
  {
    icon: '🎓',
    title: 'AI Viva',
    description: 'Test your knowledge with AI-powered oral examinations. Get instant feedback and personalized assessment.',
    category: 'Evaluative',
    accentColor: '#C4651A',
    route: '/viva',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export default function ProductsGrid() {
  return (
    <section className="section section--olive" id="products">
      <div className="container">
        <div className="section-header">
          {/* <span className="section-badge section-badge--inverse">🛠️ AI Tools</span> */}
          <h2 className="section-title">Everything You Need to Learn</h2>
          <p className="section-subtitle">
            Six powerful AI tools working together to give you the most effective,
            multi-modal learning experience.
          </p>
        </div>

        <motion.div
          className="grid grid--3"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {products.map((product) => (
            <motion.div key={product.route} variants={cardVariants}>
              <Link to={product.route} style={{ textDecoration: 'none' }}>
                <div
                  className="product-card"
                  style={{ '--accent': product.accentColor } as React.CSSProperties}
                  id={`product-${product.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="product-card__icon">{product.icon}</div>
                  <div className="product-card__category">{product.category}</div>
                  <h3 className="product-card__title">{product.title}</h3>
                  <p className="product-card__description">{product.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
