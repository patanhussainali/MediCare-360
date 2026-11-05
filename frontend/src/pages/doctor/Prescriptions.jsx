import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import PatientSearchSelect from '../../components/common/PatientSearchSelect';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate } from '../../utils/formatters';
import { axiosInstance } from '../../services/apiClient.js';
import { getItem, STORAGE_KEYS } from '../../utils/storage.js';

const DoctorPrescriptions = () => {
  const { currentUser } = useAuth();
  const { patients, prescriptions, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [detailRx, setDetailRx] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medItems, setMedItems] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'After meals' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // The MongoDB doctors document ID needed by the backend — distinct from the display profile ID.
  const [doctorDbId, setDoctorDbId] = useState(null);

  // On mount, resolve the logged-in doctor's MongoDB document ID from /api/v1/doctors
  useEffect(() => {
    const resolveDoctor = async () => {
      try {
        const token = getItem(STORAGE_KEYS.TOKEN, null);
        if (!token) return;
        const res = await axiosInstance.get('/doctors');
        const allDoctors = res.data || [];
        // Match by user_id (currentUser.id) or email
        const myDoc = allDoctors.find(
          d => String(d.user_id) === String(currentUser?.id) || d.email === currentUser?.email
        );
        if (myDoc) setDoctorDbId(myDoc.id);
      } catch (e) {
        console.warn('Could not resolve doctor DB id:', e.message);
      }
    };
    resolveDoctor();
  }, [currentUser]);

  const handleAddMedicine = () => {
    setMedItems([...medItems, { name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'After meals' }]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedItems(medItems.filter((_, i) => i !== idx));
  };

  const handleMedChange = (idx, field, val) => {
    const updated = [...medItems];
    updated[idx][field] = val;
    setMedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedPatientId) return setError('Please select a patient');
    if (!medItems[0]?.name?.trim()) return setError('Add at least one medicine name');
    if (!doctorDbId) return setError('Doctor profile not found. Contact admin to register your doctor profile.');

    setLoading(true);
    try {
      await prescriptionService.createPrescription({
        patientId: selectedPatientId,
        doctorDbId,
        diagnosis: diagnosis || 'General prescription',
        notes,
        medicines: medItems,
      }, { ...currentUser, doctorDbId });

      await refreshData();
      setIsOpen(false);
      setSelectedPatientId('');
      setDiagnosis('');
      setMedItems([{ name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'After meals' }]);
      setNotes('');
    } catch (err) {
      setError(err.message || 'Prescription creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a readable medicines string
  const getMedicineNames = (rx) => {
    const meds = rx.medicines || rx.items || [];
    if (meds.length === 0) return '—';
    return meds.map(m => m.name || m.medicine_name || '').filter(Boolean).join(', ');
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
    { header: 'Prescribed By', render: (r) => r.doctorName || currentUser?.name || '—' },
    {
      header: 'Medicines',
      render: (r) => {
        const meds = r.medicines || r.items || [];
        if (meds.length === 0) return <span className="text-slate-400 text-xs">—</span>;
        return (
          <div className="space-y-0.5 max-w-[200px]">
            {meds.map((m, i) => (
              <div key={i} className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-white">
                  {m.name || m.medicine_name || '—'}
                </span>
                {(m.dosage) && (
                  <span className="text-slate-400 ml-1">({m.dosage})</span>
                )}
              </div>
            ))}
          </div>
        );
      }
    },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Issued Date',
      render: (r) => formatDate(r.issuedAt || r.createdAt)
    },
    {
      header: 'View',
      render: (r) => (
        <button
          onClick={() => setDetailRx(r)}
          className="p-1.5 text-hospital-600 hover:bg-hospital-50 dark:hover:bg-hospital-900/30 rounded-lg transition"
          title="View full prescription"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Issue Prescriptions</h2>
          <p className="text-xs text-slate-400">Prescribe medications and dosage schedules for patients</p>
        </div>
        <button
          onClick={() => { setIsOpen(true); setError(''); }}
          className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Issue New Prescription
        </button>
      </div>

      <Table
        columns={columns}
        data={prescriptions}
        emptyTitle="No prescriptions available."
        emptyDescription="Prescriptions issued to patients will appear here."
      />

      {/* Detail Modal */}
      {detailRx && (
        <Modal isOpen={!!detailRx} onClose={() => setDetailRx(null)} title={`Prescription — ${detailRx.prescriptionNumber || detailRx.id}`}>
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
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">Prescribed Medicines</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                {(detailRx.medicines || detailRx.items || []).map((m, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {m.name || m.medicine_name || '—'} {m.dosage ? `(${m.dosage})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {m.frequency && `Frequency: ${m.frequency}`}
                      {m.duration && ` · Duration: ${m.duration}`}
                    </p>
                    {m.instructions && <p className="text-[11px] text-hospital-600 font-medium mt-0.5">Note: {m.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
            {detailRx.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-800 dark:text-amber-300 font-medium">Physician Notes: {detailRx.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Prescription Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Issue New Patient Prescription" maxWidth="max-w-3xl"
        footer={
          <>
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">Cancel</button>
            <button type="submit" form="rxForm" disabled={loading} className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft disabled:opacity-50">
              {loading ? 'Issuing...' : 'Issue Prescription'}
            </button>
          </>
        }
      >
        <form id="rxForm" onSubmit={handleSubmit} className="space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">{error}</div>
          )}
          {!doctorDbId && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs">
              ⚠️ Your doctor profile was not found in the database. Ask admin to register your doctor account before issuing prescriptions.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Patient *</label>
              <PatientSearchSelect inputId="prescription-patient" patients={patients} value={selectedPatientId} onChange={setSelectedPatientId} placeholder="Search patient by name, ID, or mobile…" className="text-sm" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis / Chief Complaint *</label>
              <input type="text" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Viral fever, Hypertension"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 dark:text-white">Prescribed Medications</h4>
              <button type="button" onClick={handleAddMedicine}
                className="text-xs font-bold text-hospital-600 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>
            <div className="space-y-3">
              {medItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Medicine Name *</label>
                      <input type="text" required placeholder="e.g. Paracetamol, Amoxicillin"
                        value={item.name} onChange={e => handleMedChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-xs" />
                    </div>
                    <div className="w-28">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Dosage</label>
                      <input type="text" value={item.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-xs" />
                    </div>
                    {medItems.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMedicine(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-5 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Frequency</label>
                      <input type="text" value={item.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Duration</label>
                      <input type="text" value={item.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Instructions</label>
                      <input type="text" value={item.instructions} onChange={e => handleMedChange(idx, 'instructions', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physician Notes</label>
            <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Additional dietary or clinical instructions..."
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorPrescriptions;
