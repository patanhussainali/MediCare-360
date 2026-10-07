import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Users, ClipboardList, Clock, Activity, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';

const NurseDashboard = () => {
  const { currentUser } = useAuth();
  const { patients, medicalRecords } = useData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-800 text-white p-6 md:p-8 rounded-3xl shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">Nurse Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Welcome, Nurse {currentUser?.name}</h2>
          <p className="text-xs md:text-sm text-blue-100 mt-1">Shift: <strong>Day Shift (08:00 AM - 04:00 PM)</strong> &bull; Department: <strong>Inpatient Ward</strong></p>
        </div>
      </div>

      {/* Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Registered Patients" value={patients.length} icon={Users} color="blue" subtext="In hospital database" />
        <StatCard title="Clinical Records" value={medicalRecords.length} icon={HeartPulse} color="teal" subtext="Patient history entries" />
        <StatCard title="Pending Vitals" value={patients.length > 0 ? patients.length : 0} icon={Activity} color="amber" subtext="Ward vitals checklist" />
        <StatCard title="Nursing Shift" value="On Duty" icon={Clock} color="purple" subtext="Active duty" />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Inpatient Monitoring Queue</h3>
          <Link to="/nurse/assigned-patients" className="text-xs font-bold text-hospital-600 hover:underline">Log Vitals</Link>
        </div>

        {patients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No patients registered in ward database.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
            {patients.map(p => (
              <div key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{p.name} ({p.id})</p>
                  <p className="text-slate-400">Gender: {p.gender} &bull; DOB: {p.dateOfBirth || 'N/A'}</p>
                </div>
                <Link
                  to="/nurse/assigned-patients"
                  className="px-3 py-1.5 bg-hospital-50 text-hospital-600 font-bold rounded-xl hover:bg-hospital-100"
                >
                  Log Vitals & Notes
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseDashboard;
