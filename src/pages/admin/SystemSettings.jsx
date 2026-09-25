import React, { useState } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { setItem, STORAGE_KEYS } from '../../utils/storage';

const SystemSettings = () => {
  const { systemSettings, resetData, refreshData } = useData();

  const [form, setForm] = useState({
    hospitalName: systemSettings.hospitalName || 'MediCare360 Medical Center',
    tagline: systemSettings.tagline || 'Excellence in Compassionate Healthcare',
    address: systemSettings.address || '742 Evergreen Health Boulevard, Medical District',
    phone: systemSettings.phone || '+1 (800) 555-3600',
    emergencyContact: systemSettings.emergencyContact || '+1 (800) 911-3600',
    email: systemSettings.email || 'contact@medicare360.org',
    operatingHours: systemSettings.operatingHours || '24/7 Emergency | Outpatient: 8:00 AM - 8:00 PM',
    taxRate: systemSettings.taxRate || 5,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setItem(STORAGE_KEYS.SYSTEM_SETTINGS, form);
    refreshData();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetAllData = () => {
    if (window.confirm('CRITICAL ACTION: Reset all system storage data to a completely clean state (0 records)? This will delete all registered patients, doctors, appointments, medical records, and bills.')) {
      resetData();
      alert('Application database successfully reset to clean initial state (0 records).');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings & Configuration</h2>
        <p className="text-xs text-slate-400">Manage hospital details, emergency contacts, operating hours, and database state</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Hospital Center Configuration</h3>
          {saved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hospital Name</label>
              <input
                type="text"
                value={form.hospitalName}
                onChange={e => setForm({ ...form, hospitalName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">24/7 Emergency Helpline</label>
              <input
                type="text"
                value={form.emergencyContact}
                onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-rose-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Contact</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Healthcare Tax Rate (%)</label>
              <input
                type="number"
                value={form.taxRate}
                onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-xl shadow-soft flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Hospital Settings
          </button>
        </form>
      </div>

      {/* Controlled System Data Reset Tool */}
      <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-3xl">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Development & Testing Clean State Reset</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Reset all application storage back to a completely clean state (0 users, 0 doctors, 0 patients, 0 appointments, 0 medical records, 0 bills).
            </p>
            <button
              onClick={handleResetAllData}
              className="mt-4 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset Database to Clean State (0 Records)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
