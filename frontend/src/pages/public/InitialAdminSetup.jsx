import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, UserCheck, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InitialAdminSetup = () => {
  const { setupMasterAdmin, hasAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await setupMasterAdmin(form);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Setup failed');
      }
    } catch (err) {
      setError(err.message || 'Setup error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-hospital-600/20 text-hospital-400 rounded-2xl border border-hospital-500/30 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">System Initial Setup</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Initialize the primary Administrator account to manage users, doctors, staff, and hospital departments.
          </p>
        </div>

        {hasAdmin && !success && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6 text-xs text-amber-300">
            <strong>Notice:</strong> An Administrator account is already configured. You can proceed to sign in.
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-6 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-hospital-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">Master Administrator Established</h3>
            <p className="text-xs text-slate-300 mb-6">
              You can now sign in with <strong>{form.email}</strong> to begin account creation and system configuration.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-sm rounded-xl shadow-card transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Administrator Name</label>
              <input
                type="text"
                required
                placeholder="Hospital Administrator"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#1B1B1D] border border-[#26272D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FE92B] focus:border-[#2FE92B] text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Administrator Email</label>
              <input
                type="email"
                required
                placeholder="admin@medicare360.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#1B1B1D] border border-[#26272D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FE92B] focus:border-[#2FE92B] text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#1B1B1D] border border-[#26272D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FE92B] focus:border-[#2FE92B] text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#1B1B1D] border border-[#26272D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FE92B] focus:border-[#2FE92B] text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2FE92B] hover:bg-[#24C421] text-black font-extrabold text-sm rounded-xl shadow-card transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Initializing System...' : 'Create Master Administrator'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InitialAdminSetup;
