import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { medicalRecordService } from '../../services/medicalRecordService';

const AssignedPatients = () => {
  const { currentUser } = useAuth();
  const { patients, medicalRecords, appointments, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [recordedPatientIds, setRecordedPatientIds] = useState(() => new Set());
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    heartRate: '75 bpm',
    temperature: '98.6 °F',
    spo2: '98%',
    notes: 'Patient stable, resting comfortably.'
  });

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      await medicalRecordService.createRecord({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorId: appointments.find(appointment => String(appointment.patientId) === String(selectedPatient.id))?.doctorId,
        diagnosis: 'Routine Nursing Vitals Log',
        symptoms: 'N/A',
        vitals,
        treatmentPlan: vitals.notes
      }, currentUser);

      const patientId = String(selectedPatient.id);
      setRecordedPatientIds(previous => new Set(previous).add(patientId));
      setIsOpen(false);
      setFeedback({ type: 'success', message: `Vitals recorded for ${selectedPatient.name}.` });
      refreshData().catch(() => {});
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error recording vitals.' });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    // Keep the MongoDB primary key internal; show the human-facing patient code.
    { header: 'Patient ID', render: (patient) => patient.userCode || patient.patientId || 'N/A' },
    { header: 'Name', accessor: 'name' },
    { header: 'Blood Group', render: (r) => <span className="font-bold text-rose-600">{r.bloodGroup || 'O+'}</span> },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Emergency Contact', render: (r) => r.emergencyContact || 'N/A' },
    {
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => {
            setFeedback(null);
            setSelectedPatient(r);
            setIsOpen(true);
          }}
          className="px-3 py-1.5 bg-hospital-600 text-white font-bold text-xs rounded-xl hover:bg-hospital-700"
        >
          {recordedPatientIds.has(String(r.id)) || medicalRecords.some(record =>
            String(record.patientId) === String(r.id) && record.diagnosis === 'Routine Nursing Vitals Log'
          ) ? 'Record Again' : 'Record Vitals'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assigned Patients & Vitals Log</h2>
        <p className="text-xs text-slate-400">Record nursing assessments, vital signs, and ward notes</p>
      </div>

      {feedback && (
        <div role="status" className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
          feedback.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
        }`}>
          {feedback.type === 'success' && <CheckCircle2 size={18} aria-hidden="true" />}
          {feedback.message}
        </div>
      )}

      <Table
        columns={columns}
        data={patients}
        emptyTitle="No assigned patients found."
        emptyDescription="Registered patients will appear here for vital signs logging."
      />

      {selectedPatient && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Log Vitals: ${selectedPatient.name}`}>
          <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  required
                  value={vitals.bloodPressure}
                  onChange={e => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Heart Rate</label>
                <input
                  type="text"
                  required
                  value={vitals.heartRate}
                  onChange={e => setVitals({ ...vitals, heartRate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Temperature</label>
                <input
                  type="text"
                  required
                  value={vitals.temperature}
                  onChange={e => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SpO2 Level</label>
                <input
                  type="text"
                  required
                  value={vitals.spo2}
                  onChange={e => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nursing Observations</label>
              <textarea
                rows="3"
                value={vitals.notes}
                onChange={e => setVitals({ ...vitals, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl"
            >
              {isSaving ? 'Saving Vitals…' : 'Save Vitals Log'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AssignedPatients;
