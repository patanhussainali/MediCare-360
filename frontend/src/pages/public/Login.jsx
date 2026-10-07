import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity, Lock, Mail, AlertCircle, ShieldAlert,
  ArrowRight, UserPlus, Sun, Moon, Stethoscope,
  HeartPulse, UserCheck, Pill, Shield, FlaskConical, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import { resetSystemStorage } from '../../utils/storage';

const ROLE_CONFIG = {
  ADMIN: {
    id: 'ADMIN',
    label: 'Admin',
    portalTitle: 'Hospital Administrator Portal',
    badge: 'Executive Access',
    icon: Shield,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'admin@medicare360.com',
    targetDashboard: '/admin/dashboard',
  },
  DOCTOR: {
    id: 'DOCTOR',
    label: 'Doctor',
    portalTitle: 'Doctor & Specialist Portal',
    badge: 'Clinical Access',
    icon: Stethoscope,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'doctor@medicare360.com',
    targetDashboard: '/doctor/dashboard',
  },
  NURSE: {
    id: 'NURSE',
    label: 'Nurse',
    portalTitle: 'Nursing Care Portal',
    badge: 'Ward Access',
    icon: HeartPulse,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'nurse@medicare360.com',
    targetDashboard: '/nurse/dashboard',
  },
  RECEPTIONIST: {
    id: 'RECEPTIONIST',
    label: 'Receptionist',
    portalTitle: 'Front Desk & Reception Portal',
    badge: 'Front Office',
    icon: UserCheck,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'receptionist@medicare360.com',
    targetDashboard: '/receptionist/dashboard',
  },
  PHARMACIST: {
    id: 'PHARMACIST',
    label: 'Pharmacist',
    portalTitle: 'Pharmacy & Dispensary Portal',
    badge: 'Pharmacy Access',
    icon: Pill,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'pharmacist@medicare360.com',
    targetDashboard: '/pharmacist/dashboard',
  },
  LAB_TECHNICIAN: {
    id: 'LAB_TECHNICIAN',
    label: 'Lab Tech',
    portalTitle: 'Diagnostic Laboratory Portal',
    badge: 'Lab Access',
    icon: FlaskConical,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'lab@medicare360.com',
    targetDashboard: '/admin/reports',
  },
  PATIENT: {
    id: 'PATIENT',
    label: 'Patient',
    portalTitle: 'Patient Health Portal',
    badge: 'Patient Portal',
    icon: User,
    defaultEmail: '',
    defaultPass: '',
    placeholder: 'patient@example.com',
    targetDashboard: '/patient/dashboard',
  },
};

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
  const { login, hasAdmin, setupMasterAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Determine initial role from route URL (e.g. /login/doctor) or query (?role=DOCTOR) or default ADMIN
  const routeRole = normalizeRoleParam(portalRole) || normalizeRoleParam(searchParams.get('role'));
  const [role, setRole] = useState(routeRole || 'ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Always reset email, password, and error whenever the selected role changes or on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, [role]);

  const currentConfig = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;
  const RoleIcon = currentConfig.icon;


  // Emergency reset: clears ALL stored data and re-initializes from scratch.
  // Use this if a migration bug corrupted stored passwords.
  const handleResetStorage = () => {
    if (window.confirm(
      '⚠️ RESET ALL DATA?\n\nThis will permanently clear ALL stored accounts, patients, appointments and other data.\n\nOnly use this if login is broken after an update.\n\nContinue?'
    )) {
      resetSystemStorage();
      window.location.reload();
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
      // Pass the selected/entry-point role to ensure role validation
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-hospital-400/20 dark:bg-hospital-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-muted-teal/20 dark:bg-muted-teal/15 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
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

          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-xl text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              MediCare<span className="text-hospital-500">360</span>
            </span>
          </Link>
        </div>

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

      {/* Main Login Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-2xl z-10 transition-colors duration-300">

          {/* Role Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-hospital-600 text-white rounded-2xl shadow-card mb-3">
              <RoleIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-hospital-50 dark:bg-hospital-900/40 text-hospital-700 dark:text-hospital-300 border border-hospital-200 dark:border-hospital-800">
                {currentConfig.badge}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{currentConfig.portalTitle}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in with your admin-assigned <span className="font-semibold text-slate-700 dark:text-slate-200">{currentConfig.label}</span> credentials
            </p>
          </div>

          {/* Initial Clean State Setup Banner */}
          {!hasAdmin && (
            <div className="p-4 bg-[#1B1B1D] border border-[#26272D] rounded-2xl mb-6 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#2FE92B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">System Clean Initial State</p>
                  <p className="mt-1 leading-relaxed text-[11px] text-slate-400">
                    No administrator account exists yet. Initialize your secure Administrator account first.
                  </p>
                  <div className="mt-3">
                    <Link to="/initial-admin-setup"
                      className="inline-block px-3 py-1.5 bg-[#2FE92B] hover:bg-[#24C421] text-black font-bold text-xs rounded-xl transition-all">
                      Open Setup Wizard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role Portal Selector Tabs */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Portal Entry Point
              </label>
              <span className="text-[10px] text-hospital-600 dark:text-hospital-400 font-semibold">
                Strict Role Check Enforced
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 dark:bg-[#1B1B1D] rounded-2xl border border-slate-200 dark:border-[#26272D]">
              {Object.values(ROLE_CONFIG).map((r) => {
                const TabIcon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      setEmail('');
                      setPassword('');
                      setError('');
                    }}
                    className={`flex flex-col items-center justify-center py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#2FE92B] text-black shadow-soft scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="truncate max-w-full">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-2xl mb-5 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form
            key={role}
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            {/* Hidden dummy fields to capture aggressive browser autofill */}
            <input type="text" name="prevent_autofill_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="prevent_autofill_pwd" style={{ display: 'none' }} tabIndex={-1} autoComplete="new-password" />

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {currentConfig.label} Email Address / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  key={`input_email_${role}`}
                  id={`input_email_${role}`}
                  name={`login_email_${role.toLowerCase()}`}
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentConfig.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-[#1B1B1D] border border-slate-200 dark:border-[#26272D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FE92B] focus:border-[#2FE92B] text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[#2FE92B] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  key={`input_pass_${role}`}
                  id={`input_pass_${role}`}
                  name={`login_pwd_${role.toLowerCase()}`}
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-[#1B1B1D] border border-slate-200 dark:border-[#26272D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FE92B] focus:border-[#2FE92B] text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2FE92B] hover:bg-[#24C421] text-black font-extrabold text-sm rounded-xl shadow-card transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Validating Role & Credentials...' : `Sign In to ${currentConfig.label} Portal`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Patient Registration Callout */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60 text-center text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Need a Patient account?</span>
            <Link to="/register" className="font-bold text-hospital-600 dark:text-hospital-400 hover:underline flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              Patient Registration
            </Link>
          </div>

          {/* Emergency Recovery */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleResetStorage}
              className="text-[10px] text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors underline underline-offset-2"
            >
              ⚠ Reset system storage (emergency only)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
