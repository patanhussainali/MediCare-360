import React from 'react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';

const PatientSearch = () => {
  const { patients } = useData();

  const columns = [
    { header: 'Medical ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'name' },
    { header: 'Phone Number', accessor: 'phone' },
    { header: 'Email Address', accessor: 'email' },
    { header: 'Blood Group', render: (r) => <span className="font-bold text-rose-600">{r.bloodGroup || 'O+'}</span> },
    { header: 'Emergency Contact', render: (r) => r.emergencyContact || 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Fast Patient Lookup Directory</h2>
        <p className="text-xs text-slate-400">Search patient database by Medical ID, phone number, or full name</p>
      </div>

      <Table
        columns={columns}
        data={patients}
        searchable={true}
        searchPlaceholder="Type name, phone, or PAT-ID to search..."
        emptyTitle="No patients found."
        emptyDescription="Registered patients will appear here."
      />
    </div>
  );
};

export default PatientSearch;
