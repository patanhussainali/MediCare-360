import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { appointmentService } from '../../services/appointmentService';

const TodayAppointments = () => {
  const { currentUser } = useAuth();
  const { appointments, doctors, refreshData } = useData();
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const [error, setError] = useState('');

  const myDoctorRecord = doctors.find(d =>
    String(d.userId) === String(currentUser?.id) ||
    String(d.id) === String(currentUser?.profileId)
  );
  const doctorId = myDoctorRecord?.id || currentUser?.profileId || currentUser?.id;

  const myAppointments = appointments.filter(a =>
    String(a.doctorId) === String(doctorId) ||
    String(a.doctorUserId) === String(currentUser?.id)
  );

  const handleUpdateStatus = async (id, status) => {
    setUpdatingAppointmentId(id);
    setError('');
    try {
      await appointmentService.updateAppointmentStatus(id, status, 'Updated by attending doctor', currentUser);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Could not update the appointment. Please try again.');
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Phone', render: (r) => r.patientPhone || 'N/A' },
    { header: 'Date', render: (r) => formatDate(r.appointmentDate) },
    { header: 'Time Slot', accessor: 'timeSlot' },
    { header: 'Type', accessor: 'type' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.status === 'Scheduled' && (
            <button
              onClick={() => handleUpdateStatus(r.id, 'In Progress')}
              disabled={updatingAppointmentId === r.id}
              className="px-2.5 py-1 bg-amber-500 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              {updatingAppointmentId === r.id ? 'Starting…' : 'Start Consult'}
            </button>
          )}
          {r.status === 'In Progress' && (
            <button
              onClick={() => handleUpdateStatus(r.id, 'Completed')}
              disabled={updatingAppointmentId === r.id}
              className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              {updatingAppointmentId === r.id ? 'Saving…' : 'Complete'}
            </button>
          )}
          {r.status === 'Completed' && (
            <span className="text-xs text-emerald-600 font-bold">Done</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assigned Appointments Queue</h2>
        <p className="text-xs text-slate-400">Live consultation management queue for attending physician</p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Table
        columns={columns}
        data={myAppointments}
        emptyTitle="No appointments scheduled."
        emptyDescription="Appointments booked with you by patients or receptionists will appear here."
      />
    </div>
  );
};

export default TodayAppointments;
