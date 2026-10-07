import React from 'react';
import { Users, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';

const PatientList = () => {
  const { patients } = useData();

  const columns = [
    { header: 'Patient ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Blood Group', render: (r) => <span className="font-bold text-rose-600">{r.bloodGroup || 'O+'}</span> },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Date of Birth', accessor: 'dateOfBirth' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registered Patient Directory</h2>
        <p className="text-xs text-slate-400">View patient profiles registered in the hospital database</p>
      </div>

      <Table
        columns={columns}
        data={patients}
        emptyTitle="No patients registered."
        emptyDescription="Registered patients will appear here."
      />
    </div>
  );
};

export default PatientList;
