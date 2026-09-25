import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity, Lock, Mail, AlertCircle, ShieldAlert,
  ArrowRight, UserPlus, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { validateEmail, validatePassword } from '../../utils/validators';

const Login = () => {
  const { login, hasAdmin, setupMasterAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [role, setRole] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'ADMIN', label: 'Admin' },
    { id: 'DOCTOR', label: 'Doctor' },
    { id: 'NURSE', label: 'Nurse' },
    { id: 'RECEPTIONIST', label: 'Receptionist' },
    { id: 'PHARMACIST', label: 'Pharmacist' },
    { id: 'PATIENT', label: 'Patient' },
  ];

  const handleQuickSetupAdmin = async () => {
    try {
      setLoading(true);
      await setupMasterAdmin({
        name: 'Hospital Administrator',
        email: 'admin@medicare360.com',
        password: 'Admin@123',
      });
      setEmail('admin@medicare360.com');
      setPassword('Admin@123');
      setError('');
      alert('Master Administrator account initialized (admin@medicare360.com / Admin@123). You may now click Sign In.');
    } catch (e) {
      setError(e.message || 'Setup error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }
    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }
    setLoading(true);
    try {
      const res = await login(email, password, role);
      if (res.success) {
        const routeMap = {
          PATIENT: '/patient/dashboard',
          DOCTOR: '/doctor/dashboard',
          NURSE: '/nurse/dashboard',
          RECEPTIONIST: '/receptionist/dashboard',
          PHARMACIST: '/pharmacist/dashboard',
          ADMIN: '/admin/dashboard',
        };
        navigate(routeMap[res.data.user.role] || '/admin/dashboard');
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300">

      {/* ── Decorative blobs ── */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-hospital-400/20 dark:bg-hospital-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-muted-teal/20 dark:bg-muted-teal/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-xl text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              MediCare<span className="text-hospital-500">360</span>
            </span>
          </Link>
        </div>

        {/* 🌗 Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" />
            : <Moon className="w-4 h-4 text-slate-600" />
          }
        </button>
      </header>

      {/* ── Login card ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-2xl z-10 transition-colors duration-300">

          {/* Logo header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-hospital-600 text-white rounded-2xl shadow-card">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">MediCare360</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">Sign in to Hospital Portal</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your designated role to access your portal</p>
          </div>

          {/* Setup banner */}
          {!hasAdmin && (
            <div className="p-4 bg-soft-sage/30 dark:bg-slate-900/80 border border-soft-sage dark:border-slate-700 rounded-2xl mb-6 text-xs text-deep-forest dark:text-soft-sage">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-hospital-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">System Clean Initial State</p>
                  <p className="mt-1 leading-relaxed text-[11px] text-muted-teal dark:text-slate-300">
                    No operational accounts exist yet. Initialize the Master Administrator account first.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleQuickSetupAdmin}
                      className="px-3 py-1.5 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-xs rounded-xl transition-all">
                      Quick Setup Admin
                    </button>
                    <Link to="/initial-admin-setup"
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-soft-sage hover:text-deep-forest text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all">
                      Setup Wizard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default Admin Credentials Helper */}
          <div className="p-3.5 bg-soft-sage/30 dark:bg-slate-900/90 border border-soft-sage dark:border-slate-700 rounded-2xl mb-5 text-xs text-deep-forest dark:text-soft-sage flex items-center justify-between">
            <div>
              <p className="font-bold text-deep-forest dark:text-light-gray">Default Admin Credentials</p>
              <p className="text-[11px] text-muted-teal dark:text-slate-400 mt-0.5">
                <span className="font-semibold">admin@medicare360.com</span> &bull; <span className="font-semibold">Admin@123</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRole('ADMIN');
                setEmail('admin@medicare360.com');
                setPassword('Admin@123');
                setError('');
              }}
              className="px-2.5 py-1 bg-hospital-600 hover:bg-deep-forest text-white text-[11px] font-bold rounded-lg shadow-xs transition-all shrink-0 ml-2"
            >
              Auto Fill
            </button>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700/60">
            {roles.map((r) => (
              <button key={r.id} type="button"
                onClick={() => { setRole(r.id); setError(''); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  role === r.id
                    ? 'bg-hospital-600 text-white shadow-soft'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-2xl mb-5 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role.toLowerCase()}@medicare360.com`}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-hospital-600 dark:text-hospital-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-sm rounded-xl shadow-card transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
              {loading ? 'Authenticating...' : `Sign In as ${role}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60 text-center text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Need a Patient account?</span>
            <Link to="/register" className="font-bold text-hospital-600 dark:text-hospital-400 hover:underline flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              Patient Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
