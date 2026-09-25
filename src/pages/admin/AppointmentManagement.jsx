import React from 'react';
import { Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

const AdminAppointmentManagement = () => {
  const { appointments } = useData();

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Assigned Doctor', accessor: 'doctorName' },
    { header: 'Department', accessor: 'department' },
    { header: 'Date', render: (r) => formatDate(r.appointmentDate) },
    { header: 'Time Slot', accessor: 'timeSlot' },
    { header: 'Type', accessor: 'appointmentType' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Master Hospital Appointments Roster</h2>
        <p className="text-xs text-slate-400">Master schedule of appointments across all doctors and departments</p>
      </div>

      <Table
        columns={columns}
        data={appointments}
        emptyTitle="No appointments scheduled."
        emptyDescription="Appointments booked by patients or staff will appear here."
      />
    </div>
  );
};

export default AdminAppointmentManagement;
