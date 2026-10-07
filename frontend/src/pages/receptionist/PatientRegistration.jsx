import React, { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { patientService } from '../../services/patientService';

const PatientRegistration = () => {
  const { currentUser } = useAuth();
  const { refreshData } = useData();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
    allergies: '',
    chronicConditions: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newPat = await patientService.createPatient(form, currentUser);
      refreshData();
      setRegisteredPatient(newPat.data || newPat);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-hospital-50 text-hospital-600 rounded-2xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Walk-in Patient Intake Registration</h2>
            <p className="text-xs text-slate-400">Register new patient profiles into system state</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl mb-6 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {registeredPatient ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Patient Record Created</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Patient ID: <strong className="text-hospital-600 font-mono text-sm">{registeredPatient.id}</strong> &bull; Name: <strong>{registeredPatient.name}</strong>
            </p>
            <button
              onClick={() => {
                setRegisteredPatient(null);
                setForm({
                  name: '', email: '', phone: '', gender: 'Male', dateOfBirth: '', bloodGroup: 'O+', address: '', emergencyContact: '', allergies: '', chronicConditions: ''
                });
              }}
              className="px-6 py-3 bg-hospital-600 text-white font-bold text-xs rounded-xl shadow-soft"
            >
              Register Another Patient
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm({...form, gender: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={e => setForm({...form, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                <select
                  value={form.bloodGroup}
                  onChange={e => setForm({...form, bloodGroup: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={form.emergencyContact}
                onChange={e => setForm({...form, emergencyContact: e.target.value})}
                placeholder="Name & Contact phone"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
            >
              {loading ? 'Creating Record...' : 'Complete Patient Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientRegistration;
