import React, { useState } from 'react';
import { Calendar, CheckCircle2, Stethoscope, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { appointmentService } from '../../services/appointmentService';

const TodayAppointments = () => {
  const { currentUser } = useAuth();
  const { appointments, doctors, refreshData } = useData();

  const myDoctorRecord = doctors.find(d => d.userId === currentUser?.id || d.id === currentUser?.profileId);
  const doctorId = myDoctorRecord?.id || currentUser?.profileId || currentUser?.id;

  const myAppointments = appointments.filter(a => a.doctorId === doctorId || a.doctorUserId === currentUser?.id);

  const handleUpdateStatus = async (id, status) => {
    await appointmentService.updateAppointmentStatus(id, status, 'Updated by attending doctor', currentUser);
    refreshData();
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Phone', render: (r) => r.patientPhone || 'N/A' },
    { header: 'Date', render: (r) => formatDate(r.appointmentDate) },
    { header: 'Time Slot', accessor: 'timeSlot' },
    { header: 'Type', accessor: 'appointmentType' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.status === 'Scheduled' && (
            <button
              onClick={() => handleUpdateStatus(r.id, 'In Progress')}
              className="px-2.5 py-1 bg-amber-500 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              Start Consult
            </button>
          )}
          {r.status === 'In Progress' && (
            <button
              onClick={() => handleUpdateStatus(r.id, 'Completed')}
              className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              Complete
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
