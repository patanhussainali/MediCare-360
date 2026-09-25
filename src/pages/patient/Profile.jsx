import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Heart, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { patientService } from '../../services/patientService';

const Profile = () => {
  const { currentUser } = useAuth();
  const { patients, refreshData } = useData();

  const myProfile = patients.find(p => p.userId === currentUser?.id || p.id === currentUser?.profileId) || {
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    bloodGroup: 'O+',
    gender: 'Not Specified',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    allergies: [],
    chronicConditions: [],
  };

  const [form, setForm] = useState(myProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (myProfile.id) {
      await patientService.updatePatient(myProfile.id, form, currentUser);
      refreshData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-hospital-600 text-white flex items-center justify-center font-bold text-xl">
              {currentUser?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{currentUser?.name}</h2>
              <p className="text-xs text-slate-400">Patient Profile & Medical History</p>
            </div>
          </div>
          {saved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Profile Updated
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={form.email}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm opacity-70"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={e => setForm({...form, bloodGroup: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={e => setForm({...form, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={form.emergencyContact}
                onChange={e => setForm({...form, emergencyContact: e.target.value})}
                placeholder="Name & Phone"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Home Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-xl shadow-soft flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
