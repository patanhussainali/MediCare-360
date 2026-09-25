import React, { useState } from 'react';
import { HeartPulse, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { patientService } from '../../services/patientService';

const PatientManagement = () => {
  const { currentUser } = useAuth();
  const { patients, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: ''
  });

  const [loading, setLoading] = useState(false);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientService.createPatient(form, currentUser);
      refreshData();
      alert(`Patient account created for ${form.name}`);
      setIsOpen(false);
      setForm({ name: '', email: '', phone: '', gender: 'Male', dateOfBirth: '', bloodGroup: 'O+', address: '', emergencyContact: '' });
    } catch (err) {
      alert(err.message || 'Error creating patient');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete patient record and associated account?')) {
      await patientService.deletePatient(id, currentUser);
      refreshData();
    }
  };

  const columns = [
    { header: 'Medical ID', accessor: 'id' },
    { header: 'Patient Name', render: (r) => <span className="font-bold">{r.name}</span> },
    { header: 'Email Login', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Blood Group', render: (r) => <span className="font-bold text-rose-600">{r.bloodGroup || 'O+'}</span> },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <button onClick={() => handleDelete(r.id)} className="text-rose-600 hover:text-rose-800">
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Patient Directory & Accounts</h2>
          <p className="text-xs text-slate-400">Manage patient master records, profiles, and account credentials</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Patient Record
        </button>
      </div>

      <Table
        columns={columns}
        data={patients}
        emptyTitle="No patients found."
        emptyDescription="Registered patient records will appear here."
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Patient Record">
        <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Creating...' : 'Create Patient Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PatientManagement;
