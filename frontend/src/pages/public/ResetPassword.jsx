import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, CheckCircle2, LockKeyhole } from 'lucide-react';
import { axiosInstance } from '../../services/apiClient';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('The passwords do not match.');
    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', { token, new_password: password });
      setDone(true);
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'This reset link is invalid or expired. Request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-slate-100 px-4 py-8 dark:bg-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <header className="mb-6 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-hospital-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">MediCare360</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Set a new password</p>
        </header>
        {done ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">Password updated</h2>
            <p className="my-3 text-sm text-slate-500">You can sign in with your new password.</p>
            <Link to="/login" className="inline-flex rounded-xl bg-hospital-600 px-5 py-3 text-sm font-bold text-white">Return to Sign In</Link>
          </div>
        ) : !token ? (
          <div className="space-y-4 text-center">
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">This password reset link is missing its token.</p>
            <Link to="/forgot-password" className="font-bold text-hospital-700 hover:underline">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              New password
              <span className="relative mt-1 block"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></span>
            </label>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Confirm new password
              <input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-hospital-600 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Updating…' : 'Update Password'}</button>
          </form>
        )}
      </section>
    </main>
  );
}
