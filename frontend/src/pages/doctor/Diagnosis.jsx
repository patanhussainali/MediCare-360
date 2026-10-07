import React, { useState } from 'react';
import { Stethoscope, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/formatters';

const Diagnosis = () => {
  const { currentUser } = useAuth();
  const { patients, medicalRecords, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    treatmentPlan: '',
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    temperature: '98.6 °F',
    spo2: '99%',
    labNotes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) return alert('Select a patient');

    setLoading(true);
    try {
      await medicalRecordService.createRecord({
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        symptoms: form.symptoms,
        treatmentPlan: form.treatmentPlan,
        vitals: {
          bloodPressure: form.bloodPressure,
          heartRate: form.heartRate,
          temperature: form.temperature,
          spo2: form.spo2,
        },
        labNotes: form.labNotes
      }, currentUser);

      refreshData();
      alert('Medical record and diagnosis entry recorded.');
      setIsOpen(false);
    } catch (err) {
      alert(err.message || 'Record creation error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Symptoms', accessor: 'symptoms' },
    { header: 'Attending Doctor', accessor: 'doctorName' },
    { header: 'Date', render: (r) => formatDate(r.date) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Clinical Diagnosis & Medical Records</h2>
          <p className="text-xs text-slate-400">Issue diagnostic assessments, treatment plans, and vital sign logs</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Add Clinical Record
        </button>
      </div>

      <Table
        columns={columns}
        data={medicalRecords}
        emptyTitle="No medical records available."
        emptyDescription="Logged clinical diagnoses will appear here."
      />

      {/* New Diagnosis Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Clinical Diagnosis Entry" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
            <select
              required
              value={form.patientId}
              onChange={e => setForm({ ...form, patientId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="">-- Choose Registered Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id}) - DOB: {p.dateOfBirth || 'N/A'}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Bronchitis"
                value={form.diagnosis}
                onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Cough, Fever, Fatigue"
                value={form.symptoms}
                onChange={e => setForm({ ...form, symptoms: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Vitals */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Patient Vitals</h4>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400">BP (mmHg)</label>
                <input
                  type="text"
                  value={form.bloodPressure}
                  onChange={e => setForm({ ...form, bloodPressure: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Heart Rate</label>
                <input
                  type="text"
                  value={form.heartRate}
                  onChange={e => setForm({ ...form, heartRate: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Temp (°F)</label>
                <input
                  type="text"
                  value={form.temperature}
                  onChange={e => setForm({ ...form, temperature: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">SpO2 (%)</label>
                <input
                  type="text"
                  value={form.spo2}
                  onChange={e => setForm({ ...form, spo2: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Treatment Plan & Clinical Notes</label>
            <textarea
              rows="3"
              value={form.treatmentPlan}
              onChange={e => setForm({ ...form, treatmentPlan: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Saving Record...' : 'Save Diagnosis Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Diagnosis;
