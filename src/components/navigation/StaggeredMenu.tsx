import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const menuItems = [
  { label: 'Upload PDF', icon: '📄', route: '/upload' },
  { label: 'Screen Reader', icon: '🔊', route: '/screenreader' },
  { label: 'Videos', icon: '🎬', route: '/video' },
  { label: 'Podcasts', icon: '🎙', route: '/podcast' },
  { label: 'Mind Maps', icon: '🗺️', route: '/mindmap' },
  { label: 'Virtual Lab', icon: '🔬', route: '/lab' },
  { label: 'Viva', icon: '🎓', route: '/viva' },
];

const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

interface StaggeredMenuProps {
  className?: string;
}

export default function StaggeredMenu({ className = '' }: StaggeredMenuProps) {
  const location = useLocation();

  return (
    <aside className={`staggered-menu ${className}`}>
      <Link to="/" className="staggered-menu__logo">
        <span className="staggered-menu__logo-icon">🧠</span>
        Teslearn
      </Link>

      <div className="staggered-menu__label">Tools</div>

      <motion.nav
        className="staggered-menu__nav"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {menuItems.map((item) => (
          <motion.div key={item.route} variants={itemVariants}>
            <Link
              to={item.route}
              className={`staggered-menu__item ${location.pathname === item.route ? 'staggered-menu__item--active' : ''
                }`}
              id={`menu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <span className="staggered-menu__icon">{item.icon}</span>
              {item.label}
            </Link>
          </motion.div>
        ))}
      </motion.nav>

      <div className="staggered-menu__footer">
        <Link to="/" className="staggered-menu__back">
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
