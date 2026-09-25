import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
