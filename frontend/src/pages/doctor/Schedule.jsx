import React, { useState } from 'react';
import { Calendar, Clock, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { doctorService } from '../../services/doctorService';

const Schedule = () => {
  const { currentUser } = useAuth();
  const { doctors, refreshData } = useData();

  const myDoctor = doctors.find(d => d.userId === currentUser?.id || d.id === currentUser?.profileId) || {
    id: currentUser?.profileId || 'DOC-101',
    name: currentUser?.name || 'Dr. Physician',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: '09:00 AM - 04:00 PM',
    status: 'Active'
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [selectedDays, setSelectedDays] = useState(myDoctor.availableDays || []);
  const [availableHours, setAvailableHours] = useState(myDoctor.availableHours || '09:00 AM - 04:00 PM');
  const [status, setStatus] = useState(myDoctor.status || 'Active');
  const [saved, setSaved] = useState(false);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (myDoctor.id) {
      await doctorService.updateDoctorSchedule(myDoctor.id, {
        availableDays: selectedDays,
        availableHours,
        status
      }, currentUser);
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
            <div className="p-3 bg-hospital-50 text-hospital-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Schedule & Availability Management</h2>
              <p className="text-xs text-slate-400">Configure consultation working hours and duty status</p>
            </div>
          </div>
          {saved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Schedule Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Practice Duty Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="Active">Active (Available for appointments)</option>
              <option value="On Leave">On Leave (Temporarily unavailable)</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Available Consultation Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedDays.includes(day)
                      ? 'bg-hospital-600 text-white border-hospital-600 shadow-soft'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Hours</label>
            <input
              type="text"
              value={availableHours}
              onChange={e => setAvailableHours(e.target.value)}
              placeholder="e.g. 09:00 AM - 04:00 PM"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-xl shadow-soft flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Schedule Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Schedule;
