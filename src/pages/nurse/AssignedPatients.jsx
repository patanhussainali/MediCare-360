import React, { useState } from 'react';
import { HeartPulse, PlusCircle, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { medicalRecordService } from '../../services/medicalRecordService';

const AssignedPatients = () => {
  const { currentUser } = useAuth();
  const { patients, medicalRecords, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
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

    try {
      await medicalRecordService.createRecord({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        diagnosis: 'Routine Nursing Vitals Log',
        symptoms: 'N/A',
        vitals,
        treatmentPlan: vitals.notes
      }, currentUser);

      refreshData();
      alert(`Vitals recorded for ${selectedPatient.name}`);
      setIsOpen(false);
    } catch (err) {
      alert(err.message || 'Error recording vitals');
    }
  };

  const columns = [
    { header: 'Patient ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Blood Group', render: (r) => <span className="font-bold text-rose-600">{r.bloodGroup || 'O+'}</span> },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Emergency Contact', render: (r) => r.emergencyContact || 'N/A' },
    {
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedPatient(r);
            setIsOpen(true);
          }}
          className="px-3 py-1.5 bg-hospital-600 text-white font-bold text-xs rounded-xl hover:bg-hospital-700"
        >
          Record Vitals
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
              className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl"
            >
              Save Vitals Log
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AssignedPatients;
