import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { pharmacyService } from '../../services/pharmacyService';
import { formatDate } from '../../utils/formatters';

const MedicineIssueRecords = () => {
  const { currentUser } = useAuth();
  const { medicines, patients, prescriptions, refreshData } = useData();

  const [issueRecords, setIssueRecords]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [isOpen, setIsOpen]               = useState(false);
  const [error, setError]                 = useState('');
  const [form, setForm] = useState({
    medicineId: '',
    patientId: '',
    prescriptionId: '',
    quantity: 1,
    notes: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await pharmacyService.getAllIssueRecords();
      setIssueRecords(res.data || []);
    } catch (e) {
      console.warn('Could not load issue records:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await pharmacyService.issueMedicine({
        medicineId:     form.medicineId,
        patientId:      form.patientId,
        prescriptionId: form.prescriptionId || null,
        quantity:       parseInt(form.quantity) || 1,
        notes:          form.notes,
      }, currentUser);
      await fetchRecords();
      await refreshData();   // re-sync medicines (stock decremented)
      setIsOpen(false);
      setForm({ medicineId: '', patientId: '', prescriptionId: '', quantity: 1, notes: '' });
    } catch (err) {
      setError(err.message || 'Failed to issue medicine');
    }
  };

  const columns = [
    {
      header: 'ID',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.id}</span>
    },
    { header: 'Medicine',    render: (r) => <span className="font-bold text-slate-800 dark:text-white">{r.medicineName}</span> },
    { header: 'Patient',     render: (r) => r.patientName || '—' },
    { header: 'Qty Issued',  render: (r) => <span className="font-bold text-hospital-600">{r.quantity} units</span> },
    { header: 'Dispensed By', render: (r) => r.dispensedBy || '—' },
    { header: 'Date',        render: (r) => formatDate(r.dispensedAt || r.createdAt) },
    { header: 'Notes',       render: (r) => <span className="text-slate-400 text-xs">{r.notes || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-hospital-600" />
            Medicine Issue Records
          </h2>
          <p className="text-xs text-slate-400">All dispensed/issued medicine records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRecords}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
            title="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setIsOpen(true); setError(''); }}
            className="px-4 py-2.5 bg-hospital-600 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2">
            <Plus className="w-4 h-4" /> Issue Medicine
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={issueRecords}
        emptyTitle="No issue records found."
        emptyDescription="Medicine dispenses will appear here once issued."
      />

      {/* Issue Medicine Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Issue / Dispense Medicine"
        footer={
          <>
            <button type="button" onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" form="issueForm"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft">
              Issue Medicine
            </button>
          </>
        }
      >
        <form id="issueForm" onSubmit={handleIssue} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medicine *</label>
            <select required value={form.medicineId} onChange={e => setForm({ ...form, medicineId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <option value="">— Select Medicine —</option>
              {medicines.filter(m => m.status !== 'Discontinued').map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.genericName ? `(${m.genericName})` : ''} — Stock: {m.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient *</label>
            <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <option value="">— Select Patient —</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.full_name} ({p.patientId || p.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
              <input type="number" min="1" required value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prescription (optional)</label>
              <select value={form.prescriptionId} onChange={e => setForm({ ...form, prescriptionId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                <option value="">— None —</option>
                {prescriptions.map(p => (
                  <option key={p.id} value={p.id}>{p.prescriptionNumber || p.id} — {p.patientName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional dispensing notes..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicineIssueRecords;
