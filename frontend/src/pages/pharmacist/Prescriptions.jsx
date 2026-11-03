import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, CheckCircle2, Eye, ReceiptText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const PharmacistPrescriptions = () => {
  const { prescriptions } = useData();
  const navigate = useNavigate();
  const [detailRx, setDetailRx] = useState(null);

  const openBilling = prescription => {
    navigate('/pharmacist/dispense-billing', {
      state: { patientId: prescription.patientId, prescriptionId: prescription.id },
    });
  };

  const columns = [
    {
      header: 'RX ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-hospital-600">
          {r.prescriptionNumber || r.rxId || r.id}
        </span>
      )
    },
    { header: 'Patient Name', render: (r) => r.patientName || '—' },
    { header: 'Prescribed By', render: (r) => r.doctorName || '—' },
    {
      header: 'Medicines',
      render: (r) => {
        const meds = r.medicines || r.items || [];
        if (meds.length === 0) return <span className="text-slate-400 text-xs">—</span>;
        return (
          <div className="space-y-0.5 max-w-[220px]">
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
    { header: 'Issued Date', render: (r) => formatDate(r.issuedAt || r.createdAt) },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailRx(r)}
            className="p-1.5 text-slate-500 hover:text-hospital-600 hover:bg-hospital-50 dark:hover:bg-hospital-900/30 rounded-lg transition"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(r.status === 'Pending' || r.status === 'Active') ? (
            <button
              onClick={() => openBilling(r)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-1 whitespace-nowrap"
            >
              <ReceiptText className="w-3.5 h-3.5" /> Dispense / Bill
            </button>
          ) : r.status === 'Dispensed' ? (
            <button onClick={() => openBilling(r)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 whitespace-nowrap dark:bg-slate-700 dark:text-slate-200">
              <ReceiptText className="w-3.5 h-3.5" /> Review Billing
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-bold px-2 py-1 rounded-lg">{r.status}</span>
          )}
        </div>
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

      {/* Detail Modal */}
      {detailRx && (
        <Modal isOpen={!!detailRx} onClose={() => setDetailRx(null)}
          title={`Prescription — ${detailRx.prescriptionNumber || detailRx.rxId || detailRx.id}`}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Patient</p>
                <p className="font-bold text-slate-800 dark:text-white">{detailRx.patientName}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Doctor</p>
                <p className="font-bold text-slate-800 dark:text-white">{detailRx.doctorName}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Diagnosis</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{detailRx.diagnosis || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Status</p>
                <Badge status={detailRx.status} />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">Medicines to Dispense</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                {(detailRx.medicines || detailRx.items || []).length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No medicine items found.</div>
                ) : (
                  (detailRx.medicines || detailRx.items || []).map((m, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-800 flex items-start gap-3">
                      <div className="p-2 bg-hospital-50 dark:bg-hospital-900/30 rounded-lg mt-0.5">
                        <Pill className="w-4 h-4 text-hospital-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {m.name || m.medicine_name || '—'}
                          {m.dosage && <span className="font-normal text-slate-500 ml-1">({m.dosage})</span>}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {m.frequency && `${m.frequency}`}
                          {m.duration && ` · ${m.duration}`}
                        </p>
                        {m.instructions && (
                          <p className="text-[11px] text-hospital-600 font-medium mt-0.5">{m.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {detailRx.status !== 'Cancelled' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { openBilling(detailRx); setDetailRx(null); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> {detailRx.status === 'Dispensed' ? 'Review Billing' : 'Continue to Dispense / Billing'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PharmacistPrescriptions;
