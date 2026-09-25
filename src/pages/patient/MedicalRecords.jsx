import React from 'react';
import { FileText, HeartPulse, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import { formatDate } from '../../utils/formatters';

const MedicalRecords = () => {
  const { currentUser } = useAuth();
  const { medicalRecords } = useData();

  const myRecords = medicalRecords.filter(r => r.patientUserId === currentUser?.id || r.patientId === currentUser?.profileId);

  const columns = [
    { header: 'Record ID', accessor: 'id' },
    { header: 'Attending Doctor', accessor: 'doctorName' },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Symptoms', accessor: 'symptoms' },
    {
      header: 'Vitals',
      render: (r) => (
        <span className="text-xs font-mono">
          BP: {r.vitals?.bloodPressure || 'N/A'} | HR: {r.vitals?.heartRate || 'N/A'}
        </span>
      )
    },
    { header: 'Date Recorded', render: (r) => formatDate(r.date) }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Medical Records</h2>
        <p className="text-xs text-slate-400">Clinical diagnoses, symptoms, and vitals logged by attending physicians</p>
      </div>

      <Table
        columns={columns}
        data={myRecords}
        emptyTitle="No medical records available."
        emptyDescription="Clinical records will appear here after a consultation with an authorized hospital doctor."
      />
    </div>
  );
};

export default MedicalRecords;
