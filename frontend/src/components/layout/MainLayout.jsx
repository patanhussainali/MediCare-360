import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  // sidebarOpen: mobile drawer open/closed
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // sidebarCollapsed: tablet icon-only mode
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Auto-collapse to icon mode on tablet (768-1023px), expand on desktop
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setSidebarCollapsed(false);
      } else if (w >= 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar widths: full=256px, collapsed/icon=72px
  const sidebarW = sidebarCollapsed ? 'w-[4.5rem]' : 'w-64';
  // Content left offset on md+ (matches sidebar width)
  const contentPl = sidebarCollapsed ? 'md:pl-[4.5rem]' : 'md:pl-64';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      {/* ── Mobile overlay backdrop ─────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarW={sidebarW}
      />

      {/* ── Main content area ───────────────────────── */}
      <div className={`flex-1 flex flex-col ${contentPl} min-w-0 transition-all duration-300`}>
        <Topbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 page-content animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
