import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Pill, CreditCard, Clock, PlusCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const { appointments, medicalRecords, prescriptions, bills } = useData();

  const myAppointments = appointments.filter(a => a.patientUserId === currentUser?.id || a.patientId === currentUser?.profileId);
  const myRecords = medicalRecords.filter(r => r.patientUserId === currentUser?.id || r.patientId === currentUser?.profileId);
  const myPrescriptions = prescriptions.filter(p => p.patientUserId === currentUser?.id || p.patientId === currentUser?.profileId);
  const myBills = bills.filter(b => b.patientUserId === currentUser?.id || b.patientId === currentUser?.profileId);

  const upcomingAppointments = myAppointments.filter(a => a.status === 'Scheduled');
  const pendingBills = myBills.filter(b => b.status === 'Pending' || b.status === 'Unpaid');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-hospital-600 to-hospital-800 text-white p-6 md:p-8 rounded-3xl shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">Patient Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Welcome, {currentUser?.name}</h2>
          <p className="text-xs md:text-sm text-hospital-100 mt-1">Manage your appointments, health history, prescriptions, and billing.</p>
        </div>
        <Link
          to="/patient/book-appointment"
          className="px-5 py-3 bg-white text-hospital-700 hover:bg-hospital-50 font-bold text-sm rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Real Calculated Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Appointments" value={myAppointments.length} icon={Calendar} color="teal" subtext={`${upcomingAppointments.length} upcoming`} />
        <StatCard title="Medical Records" value={myRecords.length} icon={FileText} color="blue" subtext="Clinical history logs" />
        <StatCard title="Prescriptions" value={myPrescriptions.length} icon={Pill} color="purple" subtext="Prescribed medications" />
        <StatCard title="Pending Bills" value={pendingBills.length} icon={CreditCard} color="rose" subtext={`${formatCurrency(pendingBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0))} due`} />
      </div>

      {/* Dashboard Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Upcoming Consultations</h3>
            <Link to="/patient/appointments" className="text-xs font-bold text-hospital-600 hover:underline">View All</Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments scheduled"
              description="You have no upcoming consultations with hospital doctors."
              actionLabel="Book Appointment"
              onAction={() => window.location.href = '/patient/book-appointment'}
            />
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{apt.doctorName}</h4>
                    <p className="text-xs text-slate-500">{apt.department} &bull; {apt.appointmentType}</p>
                    <p className="text-xs font-semibold text-hospital-600 mt-1">{formatDate(apt.appointmentDate)} at {apt.timeSlot}</p>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Active Prescriptions</h3>
            <Link to="/patient/prescriptions" className="text-xs font-bold text-hospital-600 hover:underline">View All</Link>
          </div>

          {myPrescriptions.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No prescriptions available"
              description="There are no active prescriptions issued to your patient profile."
            />
          ) : (
            <div className="space-y-3">
              {myPrescriptions.slice(0, 4).map((rx) => (
                <div key={rx.id} className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Prescription #{rx.id}</h4>
                    <p className="text-xs text-slate-500">Issued by {rx.doctorName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{rx.medicines?.length || 0} items &bull; {formatDate(rx.issuedAt)}</p>
                  </div>
                  <Badge status={rx.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
