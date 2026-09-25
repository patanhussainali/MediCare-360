import React from 'react';
import { Pill, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate } from '../../utils/formatters';

const PharmacistPrescriptions = () => {
  const { currentUser } = useAuth();
  const { prescriptions, refreshData } = useData();

  const handleDispense = async (id) => {
    await prescriptionService.updateStatus(id, 'Dispensed', currentUser);
    refreshData();
    alert(`Prescription #${id} marked as Dispensed.`);
  };

  const columns = [
    { header: 'RX ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Prescribed By', accessor: 'doctorName' },
    { header: 'Medicines', render: (r) => `${r.medicines?.length || 0} Medication(s)` },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Issued Date', render: (r) => formatDate(r.issuedAt) },
    {
      header: 'Actions',
      render: (r) => r.status === 'Pending' ? (
        <button
          onClick={() => handleDispense(r.id)}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Dispense RX
        </button>
      ) : (
        <span className="text-xs text-emerald-600 font-bold">Dispensed</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Prescription Dispensing Desk</h2>
        <p className="text-xs text-slate-400">Review doctor prescriptions and log medication dispensing</p>
      </div>

      <Table
        columns={columns}
        data={prescriptions}
        emptyTitle="No prescriptions available."
        emptyDescription="Prescriptions issued by doctors will appear here."
      />
    </div>
  );
};

export default PharmacistPrescriptions;
