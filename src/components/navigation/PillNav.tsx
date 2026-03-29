import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';

const sections = [
  { label: 'Overview', id: 'hero' },
  { label: 'Products', id: 'products' },
  { label: 'How it Works', id: 'how' },
  { label: 'Who it\'s For', id: 'personas' },
];

export default function PillNav() {
  const { activeSection, setActiveSection } = useAppStore();
  const navRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  }, [setActiveSection]);

  useEffect(() => {
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

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setActiveSection]);

  return (
    <div className="pill-nav">
      <div className="pill-nav__inner container" ref={navRef}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`pill-nav__item ${activeSection === section.id ? 'pill-nav__item--active' : ''}`}
            onClick={() => handleClick(section.id)}
            id={`pill-${section.id}`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
