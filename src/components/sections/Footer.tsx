import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <span>🧠</span>
              Teslearn
            </div>
            <p className="footer__tagline">
              An AI-powered learning operating system. Master any topic through
              multi-modal, intelligent learning experiences.
            </p>
          </div>

          <div>
            <h4 className="footer__col-title">Tools</h4>
            <div className="footer__links">
              <Link to="/assistant" className="footer__link">AI Assistant</Link>
              <Link to="/video" className="footer__link">AI Videos</Link>
              <Link to="/podcast" className="footer__link">Podcasts</Link>
              <Link to="/mindmap" className="footer__link">Mind Maps</Link>
              <Link to="/lab" className="footer__link">Virtual Lab</Link>
              <Link to="/viva" className="footer__link">AI Viva</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__col-title">Company</h4>
            <div className="footer__links">
              <a href="#" className="footer__link">About</a>
              <a href="#" className="footer__link">Blog</a>
              <a href="#" className="footer__link">Careers</a>
              <a href="#" className="footer__link">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="footer__col-title">Legal</h4>
            <div className="footer__links">
              <a href="#" className="footer__link">Privacy Policy</a>
              <a href="#" className="footer__link">Terms of Service</a>
              <a href="#" className="footer__link">Cookie Policy</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} LearnSphere. All rights reserved.
          </p>
          <div className="footer__links" style={{ flexDirection: 'row', gap: '1rem' }}>
            <a href="#" className="footer__link">Twitter</a>
            <a href="#" className="footer__link">GitHub</a>
            <a href="#" className="footer__link">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
