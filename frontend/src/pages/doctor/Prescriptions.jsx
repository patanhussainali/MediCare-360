import React, { useState } from 'react';
import { Pill, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate } from '../../utils/formatters';

const DoctorPrescriptions = () => {
  const { currentUser } = useAuth();
  const { patients, medicines, prescriptions, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [medItems, setMedItems] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'Take after meals' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMedicine = () => {
    setMedItems([...medItems, { name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'Take after meals' }]);
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
    if (!selectedPatientId) return alert('Please select a patient');
    if (medItems.length === 0 || !medItems[0].name) return alert('Add at least one medicine');

    setLoading(true);
    try {
      const pat = patients.find(p => p.id === selectedPatientId);
      await prescriptionService.createPrescription({
        patientId: pat.id,
        patientName: pat.name,
        medicines: medItems,
        notes,
      }, currentUser);

      refreshData();
      alert('Prescription issued successfully.');
      setIsOpen(false);
    } catch (err) {
      alert(err.message || 'Prescription creation error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'RX ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Prescribed By', accessor: 'doctorName' },
    { header: 'Item Count', render: (r) => `${r.medicines?.length || 0} Medicine(s)` },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Issued Date', render: (r) => formatDate(r.issuedAt) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Issue Prescriptions</h2>
          <p className="text-xs text-slate-400">Prescribe medications and dosage schedules for patients</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
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

      {/* New Prescription Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Issue New Patient Prescription" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Patient</label>
            <select
              required
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 dark:text-white">Prescribed Medications List</h4>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs font-bold text-hospital-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amoxicillin / Paracetamol"
                        value={item.name}
                        onChange={e => handleMedChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={e => handleMedChange(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs"
                      />
                    </div>
                    {medItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={e => handleMedChange(idx, 'frequency', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Duration</label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={e => handleMedChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={e => handleMedChange(idx, 'instructions', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Special Physician Notes</label>
            <textarea
              rows="2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional dietary or clinical instructions for patient..."
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-xl shadow-card"
          >
            {loading ? 'Issuing...' : 'Issue Electronic Prescription'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorPrescriptions;
