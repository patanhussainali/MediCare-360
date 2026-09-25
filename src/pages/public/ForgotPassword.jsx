import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-hospital-400/20 dark:bg-hospital-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-muted-teal/20 dark:bg-muted-teal/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Go back"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-xl text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              MediCare<span className="text-hospital-500">360</span>
            </span>
          </Link>
        </div>
        <button onClick={toggleTheme} aria-label="Toggle theme"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-2xl z-10 transition-colors duration-300">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-hospital-500" />
              <span className="text-2xl font-black text-slate-900 dark:text-white">MediCare360</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">Password Recovery</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your account email to receive password reset instructions</p>
          </div>

          {submitted ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-hospital-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instructions Sent</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                If an account with <strong>{email}</strong> exists, password reset instructions have been dispatched.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-hospital-600 dark:text-hospital-400 hover:underline">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="user@medicare360.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 placeholder-slate-400 transition-colors" />
                </div>
              </div>
              <button type="submit"
                className="w-full py-3 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-sm rounded-xl shadow-soft transition-all">
                Send Reset Link
              </button>
              <div className="text-center">
                <Link to="/login" className="text-xs text-hospital-600 dark:text-hospital-400 hover:underline font-semibold">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
