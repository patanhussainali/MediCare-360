import React from 'react';
import { Activity, HeartPulse } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import { formatDate } from '../../utils/formatters';

const PatientMonitoring = () => {
  const { medicalRecords } = useData();

  const columns = [
    { header: 'Record ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Diagnosis / Log', accessor: 'diagnosis' },
    { header: 'BP', render: (r) => r.vitals?.bloodPressure || 'N/A' },
    { header: 'Heart Rate', render: (r) => r.vitals?.heartRate || 'N/A' },
    { header: 'Temp', render: (r) => r.vitals?.temperature || 'N/A' },
    { header: 'SpO2', render: (r) => r.vitals?.spo2 || 'N/A' },
    { header: 'Date', render: (r) => formatDate(r.date) }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Patient Vitals & Ward Monitoring</h2>
        <p className="text-xs text-slate-400">Monitoring grid for patient vitals, oxygenation, and temperature trends</p>
      </div>

      <Table
        columns={columns}
        data={medicalRecords}
        emptyTitle="No monitoring records available."
        emptyDescription="Logged vitals will appear here in the monitoring grid."
      />
    </div>
  );
};

export default PatientMonitoring;
