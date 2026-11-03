import React, { useState } from 'react';
import { Pill, Printer, FileText, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const PatientPrescriptions = () => {
  const { currentUser } = useAuth();
  const { prescriptions } = useData();
  const [selectedRx, setSelectedRx] = useState(null);

  // Filter to only this patient's prescriptions
  const myPrescriptions = prescriptions.filter(p =>
    p.patientUserId === currentUser?.id ||
    p.patientId === currentUser?.profileId ||
    String(p.patientId) === String(currentUser?.profileId) ||
    // Also match by patient name (fallback for localStorage-cached prescriptions)
    (p.patientName && currentUser?.name && p.patientName.toLowerCase() === currentUser.name.toLowerCase())
  );

  const columns = [
    {
      header: 'Prescription ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-hospital-600">
          {r.prescriptionNumber || r.rxId || r.id}
        </span>
      )
    },
    { header: 'Prescribed By', render: (r) => r.doctorName || '—' },
    {
      header: 'Medicines',
      render: (r) => {
        const meds = r.medicines || r.items || [];
        if (meds.length === 0) return <span className="text-slate-400 text-xs">—</span>;
        return (
          <div className="space-y-0.5 max-w-[200px]">
            {meds.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-hospital-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-white">
                  {m.name || m.medicine_name || '—'}
                </span>
                {m.dosage && <span className="text-slate-400">({m.dosage})</span>}
              </div>
            ))}
          </div>
        );
      }
    },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Date', render: (r) => formatDate(r.issuedAt || r.createdAt) },
    {
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => setSelectedRx(r)}
          className="text-xs font-bold text-hospital-600 hover:underline flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> View Details
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
          title={`Prescription — ${selectedRx.prescriptionNumber || selectedRx.rxId || selectedRx.id}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Prescribed By</p>
                <p className="font-bold text-slate-800 dark:text-white">{selectedRx.doctorName || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Issued On</p>
                <p className="font-bold text-slate-800 dark:text-white">{formatDate(selectedRx.issuedAt || selectedRx.createdAt)}</p>
              </div>
              {selectedRx.diagnosis && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl col-span-2">
                  <p className="text-slate-400 mb-0.5">Diagnosis</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedRx.diagnosis}</p>
                </div>
              )}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Status</p>
                <Badge status={selectedRx.status} />
              </div>
            </div>

            {/* Medicines list */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Pill className="w-4 h-4 text-hospital-600" /> Prescribed Medications
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                {(selectedRx.medicines || selectedRx.items || []).length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No medicine items found.</div>
                ) : (
                  (selectedRx.medicines || selectedRx.items || []).map((m, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-800 flex items-start gap-3">
                      <div className="p-2 bg-hospital-50 dark:bg-hospital-900/30 rounded-lg mt-0.5">
                        <Pill className="w-4 h-4 text-hospital-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {m.name || m.medicine_name || '—'}
                          {m.dosage && <span className="font-normal text-slate-500 ml-1.5">({m.dosage})</span>}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {[m.frequency, m.duration].filter(Boolean).join(' · ')}
                        </p>
                        {m.instructions && (
                          <p className="text-[11px] text-hospital-600 font-medium mt-0.5">
                            💊 {m.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedRx.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-800 dark:text-amber-300 font-medium">📋 {selectedRx.notes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-hospital-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-hospital-700 transition"
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

export default PatientPrescriptions;
