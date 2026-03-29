import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const homeSections = [
  { label: 'Overview', id: 'hero' },
  { label: 'Products', id: 'products' },
  { label: 'How it Works', id: 'how' },
  { label: 'Who it\'s For', id: 'personas' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { toggleSidebar, activeSection, setActiveSection } = useAppStore();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section tracking on homepage
  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    homeSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHome, setActiveSection]);

  const handleSectionClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <nav className="navbar" style={scrolled ? { boxShadow: 'var(--shadow-md)' } : undefined}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🧠</span>
          Teslearn
        </Link>

        {/* Homepage: show section pills instead of plain links */}
        {isHome ? (
          <div className="navbar__pills">
            {homeSections.map((section) => (
              <button
                key={section.id}
                className={`navbar__pill ${activeSection === section.id ? 'navbar__pill--active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="navbar__links">
            <Link to="/" className="navbar__link">Home</Link>
            <Link to="/assistant" className="navbar__link">Assistant</Link>
          </div>
        )}

        <div className="navbar__actions">
          <Link to="/upload" className="btn btn--outline btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
            Upload PDF
          </Link>
          <Link to="/assistant" className="btn btn--primary btn--sm">
            Get Started
          </Link>
          <button className="navbar__menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
