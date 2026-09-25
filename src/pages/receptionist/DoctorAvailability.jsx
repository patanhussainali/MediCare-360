import React from 'react';
import { Stethoscope } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const DoctorAvailability = () => {
  const { doctors } = useData();

  const columns = [
    { header: 'Doctor ID', accessor: 'id' },
    { header: 'Doctor Name', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Room No', render: (r) => r.roomNumber || 'Room 101' },
    { header: 'Duty Hours', render: (r) => r.availableHours || '09:00 AM - 04:00 PM' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Availability Roster</h2>
        <p className="text-xs text-slate-400">Real-time status of hospital specialists, rooms, and shift hours</p>
      </div>

      <Table
        columns={columns}
        data={doctors}
        emptyTitle="No doctors registered."
        emptyDescription="Registered doctors will appear here."
      />
    </div>
  );
};

export default DoctorAvailability;
