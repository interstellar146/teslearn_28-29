import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StaggeredMenu from '../components/navigation/StaggeredMenu';
import { useAppStore } from '../store/useAppStore';

const pageTitles: Record<string, string> = {
  '/assistant': 'AI Assistant',
  '/video': 'AI Videos',
  '/podcast': 'AI Podcasts',
  '/mindmap': 'Mind Maps',
  '/lab': 'Virtual Lab',
  '/viva': 'AI Viva',
};

// Pages that use their own full-screen layout (no topbar / workspace wrapper)
const fullscreenPages: string[] = [];

const fullWidthPages: string[] = ['/mindmap', '/lab'];

export default function AppLayout() {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useAppStore();
  const title = pageTitles[location.pathname] || 'Teslearn';
  const isFullscreen = fullscreenPages.includes(location.pathname);
  const isFullWidth = fullWidthPages.includes(location.pathname);

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <StaggeredMenu />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />
            <motion.div
              className="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <StaggeredMenu />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="app-layout__main">
        {isFullscreen ? (
          /* Fullscreen layout — page handles its own topbar */
          <div className="app-fullscreen">
            <Outlet />
          </div>
        ) : (
          <>
            <header className="app-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  className="navbar__menu-btn"
                  onClick={() => useAppStore.getState().toggleSidebar()}
                  aria-label="Toggle sidebar"
                  style={{ display: 'none' }}
                >
                  ☰
                </button>
                <h1 className="app-topbar__title">{title}</h1>
              </div>
              <div className="app-topbar__actions">
                <div className="app-topbar__avatar">U</div>
              </div>
            </header>
            <div className={`app-workspace ${isFullWidth ? 'app-workspace--full' : ''}`}>
              <Outlet />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
