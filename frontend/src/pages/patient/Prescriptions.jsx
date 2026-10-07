import React, { useState } from 'react';
import { Pill, Printer, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const Prescriptions = () => {
  const { currentUser } = useAuth();
  const { prescriptions } = useData();
  const [selectedRx, setSelectedRx] = useState(null);

  const myPrescriptions = prescriptions.filter(p => p.patientUserId === currentUser?.id || p.patientId === currentUser?.profileId);

  const columns = [
    { header: 'Prescription ID', accessor: 'id' },
    { header: 'Prescribed By', accessor: 'doctorName' },
    { header: 'Medicines Count', render: (r) => `${r.medicines?.length || 0} Item(s)` },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Date', render: (r) => formatDate(r.issuedAt) },
    {
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => setSelectedRx(r)}
          className="text-xs font-bold text-hospital-600 hover:underline flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" /> View Prescription
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Prescriptions</h2>
        <p className="text-xs text-slate-400">Electronic prescriptions issued by hospital doctors</p>
      </div>

      <Table
        columns={columns}
        data={myPrescriptions}
        emptyTitle="No prescriptions available."
        emptyDescription="Prescriptions issued by your doctor will appear here."
      />

      {/* Prescription Detail Modal */}
      {selectedRx && (
        <Modal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`Prescription #${selectedRx.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Prescribed By: {selectedRx.doctorName}</p>
                <p className="text-slate-500">Issued On: {formatDate(selectedRx.issuedAt)}</p>
              </div>
              <Badge status={selectedRx.status} />
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">Prescribed Medications:</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                {selectedRx.medicines?.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{m.name} ({m.dosage})</p>
                      <p className="text-[11px] text-slate-500">Frequency: {m.frequency} &bull; Duration: {m.duration}</p>
                      {m.instructions && <p className="text-[11px] text-hospital-600 font-medium">Notes: {m.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-hospital-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Prescription
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Prescriptions;
