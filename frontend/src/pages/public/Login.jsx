import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity, Lock, Mail, AlertCircle,
  ArrowRight, UserPlus, Sun, Moon, Stethoscope,
  HeartPulse, UserCheck, Pill, Shield, FlaskConical, User,
  ChevronDown, Check, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { validateEmail, validatePassword } from '../../utils/validators';

const ROLE_CONFIG = {
  ADMIN: {
    id: 'ADMIN',
    label: 'Admin',
    portalTitle: 'Hospital Administrator Portal',
    badge: 'Executive Access',
    icon: Shield,
    placeholder: 'Enter administrator email',
    targetDashboard: '/admin/dashboard',
  },
  DOCTOR: {
    id: 'DOCTOR',
    label: 'Doctor',
    portalTitle: 'Doctor & Specialist Portal',
    badge: 'Clinical Access',
    icon: Stethoscope,
    placeholder: 'Enter doctor email',
    targetDashboard: '/doctor/dashboard',
  },
  NURSE: {
    id: 'NURSE',
    label: 'Nurse',
    portalTitle: 'Nursing Care Portal',
    badge: 'Ward Access',
    icon: HeartPulse,
    placeholder: 'Enter nurse email',
    targetDashboard: '/nurse/dashboard',
  },
  RECEPTIONIST: {
    id: 'RECEPTIONIST',
    label: 'Receptionist',
    portalTitle: 'Front Desk & Reception Portal',
    badge: 'Front Office',
    icon: UserCheck,
    placeholder: 'Enter receptionist email',
    targetDashboard: '/receptionist/dashboard',
  },
  PHARMACIST: {
    id: 'PHARMACIST',
    label: 'Pharmacist',
    portalTitle: 'Pharmacy & Dispensary Portal',
    badge: 'Pharmacy Access',
    icon: Pill,
    placeholder: 'Enter pharmacist email',
    targetDashboard: '/pharmacist/dashboard',
  },
  LAB_TECHNICIAN: {
    id: 'LAB_TECHNICIAN',
    label: 'Lab Tech',
    portalTitle: 'Diagnostic Laboratory Portal',
    badge: 'Lab Access',
    icon: FlaskConical,
    placeholder: 'Enter lab technician email',
    targetDashboard: '/admin/reports',
  },
  PATIENT: {
    id: 'PATIENT',
    label: 'Patient',
    portalTitle: 'Patient Health Portal',
    badge: 'Patient Portal',
    icon: User,
    placeholder: 'Enter patient email',
    targetDashboard: '/patient/dashboard',
  },
};

const BACKGROUNDS = [
  { id: 'doctor-portrait', label: 'Doctor Portrait', src: '/images/login-doctor-bg.jpg' },
  { id: 'ref-doctor', label: 'Reference Doctor', src: '/images/login-ref-doctor.png' },
  { id: 'hospital-team', label: 'Hospital Team', src: '/images/login-hospital-team.jpg' },
];

const normalizeRoleParam = (param) => {
  if (!param) return null;
  const p = param.toLowerCase().replace(/[-_]/g, '');
  if (p === 'doctor' || p === 'doc') return 'DOCTOR';
  if (p === 'nurse') return 'NURSE';
  if (p === 'admin' || p === 'administrator') return 'ADMIN';
  if (p === 'receptionist' || p === 'reception') return 'RECEPTIONIST';
  if (p === 'pharmacist' || p === 'pharmacy') return 'PHARMACIST';
  if (p === 'labtechnician' || p === 'technician' || p === 'lab') return 'LAB_TECHNICIAN';
  if (p === 'patient') return 'PATIENT';
  return null;
};

const Login = () => {
  const { portalRole } = useParams();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Role resolution
  const routeRole = normalizeRoleParam(portalRole) || normalizeRoleParam(searchParams.get('role'));
  const [role, setRole] = useState(routeRole || 'ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const [error, setError] = useState(
    searchParams.get('error') === 'deactivated'
      ? 'Your account has been deactivated. Please contact Hospital Administration.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeRole) {
      setRole(routeRole);
      setError('');
    }
  }, [routeRole]);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, [role]);

  const currentConfig = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;
  const RoleIcon = currentConfig.icon;

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
        const dest = ROLE_CONFIG[res.data.user.role]?.targetDashboard || '/admin/dashboard';
        navigate(dest);
      } else {
        setError(res.error || 'Invalid credentials or unauthorized role.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials or unauthorized role.');
    } finally {
      setLoading(false);
    }
  };

  const currentBg = BACKGROUNDS[bgIndex];

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-slate-900 select-none">
      {/* ── Background Image Layer ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={currentBg.src}
          alt="Healthcare background"
          className="w-full h-full object-cover object-right transition-all duration-700"
        />
        {/* Soft contrast scrim */}
        <div className="absolute inset-0 bg-slate-950/20 dark:bg-slate-950/50" />
        {/* Left-side mask to ensure clean backdrop behind the teal login card */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Bar ── */}
      <header className="relative z-30 px-6 py-4 flex items-center justify-between">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs font-bold shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all border border-white/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Right Tools & Brand Header */}
        <div className="flex items-center gap-3">
          {/* Background Switcher Pill */}
          <button
            onClick={() => setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length)}
            title="Switch Background Image"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all border border-white/20"
          >
            <ImageIcon className="w-4 h-4 text-[#087f8c] dark:text-teal-400" />
            <span>BG: {currentBg.label}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all border border-white/20"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Top-Right Logo (Matches HIMS style in reference image) */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/30 shadow-lg">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#087f8c] to-[#2FE92B] flex items-center justify-center text-white shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                MediCare<span className="text-[#087f8c] dark:text-teal-400">360</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout (Left Teal Container + White Login Card + Right View) ── */}
      <main className="relative z-20 flex-1 flex items-stretch">
        <div className="w-full max-w-7xl mx-auto flex items-center px-4 sm:px-6 py-6 lg:py-10">

          {/* Curved Teal Framing Panel (Exact layout from 2nd reference image) */}
          <div className="w-full lg:w-[500px] xl:w-[540px] bg-[#0c6b73]/95 dark:bg-[#08484e]/95 backdrop-blur-md rounded-3xl lg:rounded-tr-[100px] lg:rounded-br-3xl shadow-2xl p-6 sm:p-10 flex flex-col justify-center border border-teal-500/30">

            {/* Inner White Card */}
            <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all">

              {/* Card Header: "SIGN IN" */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">
                  SIGN IN
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#087f8c] animate-pulse" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currentConfig.portalTitle}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl mb-4 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role Dropdown Selector (Matches "Employee ⌵" from Reference Image) */}
              <div className="relative mb-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Role / Portal Type
                </label>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-semibold text-sm shadow-sm hover:border-[#087f8c] transition-all focus:outline-none focus:ring-2 focus:ring-[#087f8c]/40"
                >
                  <div className="flex items-center gap-2.5">
                    <RoleIcon className="w-4 h-4 text-[#087f8c] dark:text-teal-400" />
                    <span>{currentConfig.label}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {currentConfig.badge}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#087f8c] text-white flex items-center justify-center">
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Dropdown Options */}
                {roleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto">
                    {Object.values(ROLE_CONFIG).map((r) => {
                      const Icon = r.icon;
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setRole(r.id);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-900/40 text-[#087f8c] dark:text-teal-300'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{r.label}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({r.badge})</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#087f8c]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {/* Username / Email field */}
                <div>
                  <div className="relative">
                    <input
                      id={`input_email_${role}`}
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Username / Email"
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087f8c] focus:border-[#087f8c] text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all"
                    />
                    <Mail className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="relative">
                    <input
                      id={`input_pass_${role}`}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087f8c] focus:border-[#087f8c] text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Row: Login Button + Forgot Password Link */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-6 bg-[#087f8c] hover:bg-[#066a75] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      <span>Login</span>
                    )}
                  </button>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#087f8c] dark:hover:text-teal-400 transition-colors whitespace-nowrap"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>

              {/* Quick Role Switcher Chips */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Quick Portal Switch
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {Object.values(ROLE_CONFIG).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRole(r.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                        role === r.id
                          ? 'bg-[#087f8c] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Registration Callout */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Need a patient account?</span>
                <Link
                  to="/register"
                  className="font-bold text-[#087f8c] dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register Now
                </Link>
              </div>

            </div>
          </div>

          {/* Desktop Right Side Brand Watermark / Info Badge */}
          <div className="hidden lg:flex flex-1 flex-col justify-end items-end p-8 text-right text-white">
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl max-w-sm">
              <div className="flex items-center justify-end gap-2 text-teal-300 text-xs font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2FE92B] animate-pulse" />
                Hospital Management &amp; Clinical Care
              </div>
              <p className="text-sm font-extrabold text-white">
                Trusted by 500+ Healthcare Specialists
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Unified patient electronic health records, secure pharmacy dispensing &amp; multi-department coordination.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-30 px-6 py-3 text-center text-xs text-white/70 backdrop-blur-sm">
        &copy; 2026 MediCare360 Hospital Management Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
