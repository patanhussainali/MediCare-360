import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserPlus, CreditCard, Stethoscope, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const ReceptionDashboard = () => {
  const { currentUser } = useAuth();
  const { patients, doctors, appointments, stats } = useData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-700 to-hospital-800 text-white p-6 md:p-8 rounded-3xl shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">Reception & Desk Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Welcome, {currentUser?.name}</h2>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">Hospital Front Desk & Patient Intake Center</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/receptionist/patient-registration"
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-soft flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Register Patient
          </Link>
        </div>
      </div>

      {/* Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="teal" subtext="Registered in database" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="blue" subtext="Scheduled for today" />
        <StatCard title="Active Doctors" value={stats.activeDoctors} icon={Stethoscope} color="amber" subtext="Available for consultation" />
        <StatCard title="Pending Invoices" value={stats.pendingBills} icon={CreditCard} color="rose" subtext="Awaiting payment" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doctor Availability Matrix */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Doctor Availability Matrix</h3>
            <Link to="/receptionist/doctor-availability" className="text-xs font-bold text-hospital-600 hover:underline">View All</Link>
          </div>

          {doctors.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No doctors registered in system database.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {doctors.map(d => (
                <div key={d.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{d.name}</p>
                    <p className="text-slate-400">{d.department} &bull; Hours: {d.availableHours}</p>
                  </div>
                  <Badge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Patient Lookup */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Fast Patient Search & Intake</h3>
            <p className="text-xs text-slate-400 mb-6">Instantly search patient records by medical ID, phone, or name for appointment check-in.</p>
          </div>
          <Link
            to="/receptionist/patient-search"
            className="w-full py-3.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Open Patient Directory Search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
