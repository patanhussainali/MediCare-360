import React from 'react';
import { Calendar, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { appointmentService } from '../../services/appointmentService';

const MyAppointments = () => {
  const { currentUser } = useAuth();
  const { appointments, refreshData } = useData();

  const myAppointments = appointments.filter(a => a.patientUserId === currentUser?.id || a.patientId === currentUser?.profileId);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await appointmentService.cancelAppointment(id, 'Cancelled by patient', currentUser);
      refreshData();
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Doctor', accessor: 'doctorName' },
    { header: 'Department', accessor: 'department' },
    { header: 'Date', render: (r) => formatDate(r.appointmentDate) },
    { header: 'Time Slot', accessor: 'timeSlot' },
    { header: 'Type', accessor: 'appointmentType' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => r.status === 'Scheduled' ? (
        <button
          onClick={() => handleCancel(r.id)}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
        >
          <XCircle className="w-3.5 h-3.5" /> Cancel
        </button>
      ) : <span className="text-xs text-slate-400">N/A</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Appointments</h2>
          <p className="text-xs text-slate-400">History and live schedule of doctor appointments</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={myAppointments}
        emptyTitle="No appointments scheduled."
        emptyDescription="You have not booked any appointments in the hospital platform yet."
        emptyActionLabel="Book Appointment Now"
        onEmptyAction={() => window.location.href = '/patient/book-appointment'}
      />
    </div>
  );
};

export default MyAppointments;
