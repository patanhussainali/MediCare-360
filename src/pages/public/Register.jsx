import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, Phone, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Register = () => {
  const { registerPatient } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: 'Male',
    dateOfBirth: '', bloodGroup: 'O+', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await registerPatient(form);
      if (res.success) setSuccess(true);
      else setError(res.error || 'Registration failed');
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 placeholder-slate-400 transition-colors text-xs";
  const labelClass = "block font-semibold text-slate-600 dark:text-slate-300 mb-1 text-xs";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300">
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
        <div className="max-w-lg w-full bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-2xl z-10 transition-colors duration-300">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-hospital-500" />
              <span className="text-2xl font-black text-slate-900 dark:text-white">MediCare360</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">Patient Portal Registration</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create your patient profile to book appointments and view records</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-2xl mb-4 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-hospital-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Patient Profile Registered</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">You can now sign in with your email address to access your patient dashboard.</p>
              <button onClick={() => navigate('/login')} className="w-full py-3 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-sm rounded-xl transition-all">
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jane Doe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@example.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 019-2834" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={inputClass}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" required value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} className={inputClass}>
                    {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-sm rounded-xl shadow-soft transition-all disabled:opacity-50 mt-4">
                {loading ? 'Creating Profile...' : 'Complete Patient Registration'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-hospital-600 dark:text-hospital-400 hover:underline">Sign In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
