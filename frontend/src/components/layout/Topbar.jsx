import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ShieldAlert, CheckCircle, ChevronDown, RefreshCw, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { formatDateTime } from '../../utils/formatters';

const Topbar = ({ toggleSidebar }) => {
  const { currentUser, logout, login } = useAuth();
  const { notifications, resetData } = useData();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const navigate = useNavigate();

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id || n.userId === 'GLOBAL');
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#1B1B1D]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#26272D] px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#26272D] transition-colors md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex flex-col">
          <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
            Welcome back, {currentUser?.name || 'User'}
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Hospital Management System &bull; Active Portal
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#141518] hover:bg-slate-200 dark:hover:bg-[#26272D] border border-slate-200 dark:border-[#26272D] text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Toggle light/dark mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        {/* Reset System Data Tool (Admin only or dev helper) */}
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => {
              if (window.confirm('Reset all operational system data to a clean initial state (0 records)?')) {
                resetData();
                alert('System storage successfully reset to clean state (0 records).');
              }
            }}
            title="Reset system state to 0 records"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 border border-rose-200 text-xs font-semibold rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clean State Reset</span>
          </button>
        )}

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h4>
                <span className="text-xs text-slate-400 font-semibold">{userNotifications.length} total</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No new notifications.
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(notif.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#26272D] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[#2FE92B] text-black flex items-center justify-center font-bold text-sm shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {currentUser?.name || 'Account'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{currentUser?.role}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#18191D] rounded-2xl shadow-2xl border border-slate-100 dark:border-[#26272D] py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-[#26272D]">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
