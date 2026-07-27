import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // Only force scroll-to-top when moving forward to a new page (clicking a
    // link). On back/forward (POP), leave scroll alone so the browser's own
    // history-scroll restoration can return the reader to where they were —
    // this is what makes "jump to a tool, then come back" actually work.
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
    setSidebarOpen(false);
  }, [location.pathname, navigationType]);

  return (
    <div className="min-h-screen">
      <Header onMenuClick={isHome ? undefined : () => setSidebarOpen((v) => !v)} />
      <div className="flex">
        {!isHome && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
