import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Pill, Clock, Stethoscope, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { appointments, medicalRecords, prescriptions, doctors } = useData();

  const myDoctorRecord = doctors.find(d => d.userId === currentUser?.id || d.id === currentUser?.profileId);
  const doctorId = myDoctorRecord?.id || currentUser?.profileId || currentUser?.id;

  const myAppointments = appointments.filter(a => a.doctorId === doctorId || a.doctorUserId === currentUser?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = myAppointments.filter(a => a.appointmentDate === todayStr);

  const pendingConsults = myAppointments.filter(a => a.status === 'Scheduled' || a.status === 'In Progress');
  const completedConsults = myAppointments.filter(a => a.status === 'Completed');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 to-hospital-900 text-white p-6 md:p-8 rounded-3xl shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">Doctor Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Welcome, {currentUser?.name}</h2>
          <p className="text-xs md:text-sm text-hospital-100 mt-1">
            Department: <strong>{myDoctorRecord?.department || currentUser?.department || 'General Healthcare'}</strong> &bull; Status: <strong className="text-emerald-300">{myDoctorRecord?.status || 'Active'}</strong>
          </p>
        </div>
        <Link
          to="/doctor/prescriptions"
          className="px-5 py-3 bg-white text-hospital-800 hover:bg-hospital-50 font-bold text-sm rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Issue Prescription</span>
        </Link>
      </div>

      {/* Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Consultations" value={todayAppointments.length} icon={Calendar} color="teal" subtext="Scheduled for today" />
        <StatCard title="Pending Queue" value={pendingConsults.length} icon={Clock} color="amber" subtext="Awaiting consultation" />
        <StatCard title="Completed Consults" value={completedConsults.length} icon={Stethoscope} color="blue" subtext="Total finished visits" />
        <StatCard title="Total Appointments" value={myAppointments.length} icon={Users} color="purple" subtext="All time assigned" />
      </div>

      {/* Today's Queue */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Today's Appointment Schedule</h3>
          <Link to="/doctor/today-appointments" className="text-xs font-bold text-hospital-600 hover:underline">Manage Queue</Link>
        </div>

        {todayAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments scheduled for today."
            description="Patients scheduled for today will appear here in your queue."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{apt.patientName}</h4>
                  <p className="text-xs text-slate-500">Slot: {apt.timeSlot} &bull; Type: {apt.appointmentType}</p>
                  {apt.reason && <p className="text-xs text-slate-400 mt-0.5">Reason: {apt.reason}</p>}
                </div>
                <Badge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
