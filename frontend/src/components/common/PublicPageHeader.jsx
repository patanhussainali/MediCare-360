import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Shared header used by every public page.
 * Shows: back button | logo | theme toggle | sign-in CTA
 *
 * Props:
 *  - showBack    {boolean}  show ← back button (default true)
 *  - darkCard    {boolean}  dark background variant for auth pages (Login/Register/Forgot)
 */
const PublicPageHeader = ({ showBack = true, darkCard = false }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const base = darkCard
    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
    : 'bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-3.5 flex items-center justify-between ${base}`}
    >
      {/* ← Back button */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all
              ${darkCard
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-xl text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <span className={`text-lg font-black tracking-tight ${darkCard ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            MediCare<span className="text-hospital-500">360</span>
          </span>
        </Link>
      </div>

      {/* Right side: theme toggle + CTA */}
      <div className="flex items-center gap-3">
        {/* 🌗 Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`p-2.5 rounded-xl border transition-all
            ${darkCard
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" />
            : <Moon className={`w-4 h-4 ${darkCard ? 'text-slate-300' : 'text-slate-600'}`} />
          }
        </button>

        {/* Sign In CTA */}
        <Link
          to="/login"
          className="px-4 py-2 bg-hospital-600 hover:bg-deep-forest text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
};

export default PublicPageHeader;
