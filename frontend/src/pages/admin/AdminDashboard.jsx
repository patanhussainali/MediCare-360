import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Stethoscope, HeartPulse, UserPlus, Calendar, CreditCard, Pill, BarChart3, Settings, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { stats, auditLogs, resetData } = useData();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-hospital-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-card border border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-hospital-500/20 text-hospital-400 border border-hospital-500/30 px-3 py-1 rounded-full">Administrator Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Executive Management Console</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1">Full control over hospital users, clinical staff, departments, pharmacy, billing, and audit logs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/doctors"
            className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-1.5"
          >
            <Stethoscope className="w-4 h-4" /> Add Doctor
          </Link>
          <Link
            to="/admin/staff"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Add Staff
          </Link>
        </div>
      </div>

      {/* Real Dynamic System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Registered Doctors" value={stats.totalDoctors} icon={Stethoscope} color="teal" subtext={`${stats.activeDoctors} active`} />
        <StatCard title="Registered Patients" value={stats.totalPatients} icon={HeartPulse} color="blue" subtext="Inpatient & Outpatient" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} color="purple" subtext={`${stats.todayAppointments} today`} />
        <StatCard title="Hospital Revenue" value={formatCurrency(stats.totalRevenue)} icon={CreditCard} color="emerald" subtext={`${formatCurrency(stats.pendingRevenue)} pending`} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Hospital Staff</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalNurses + stats.totalReceptionists + stats.totalPharmacists} Members
            </h4>
            <p className="text-xs text-slate-500 mt-1">{stats.totalNurses} Nurses &bull; {stats.totalReceptionists} Desk &bull; {stats.totalPharmacists} Pharmacy</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Pharmacy Inventory</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalMedicines} Items
            </h4>
            <p className="text-xs text-slate-500 mt-1">{stats.lowStockMedicines} low stock warnings</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">System Status</p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">Operational</h4>
            <p className="text-xs text-slate-500 mt-1">Local Storage Persistent State</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Audit Activity */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">System Audit Event History</h3>
            <p className="text-xs text-slate-400">Live immutable logs recorded during application operations</p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs font-bold text-hospital-600 hover:underline">Full Audit Log</Link>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No audit events recorded yet. System activities will log automatically here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">{log.action}</span>
                  <p className="text-slate-500 mt-0.5">{log.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{log.userName}</span>
                  <p className="text-[10px] text-slate-400">{formatDateTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
