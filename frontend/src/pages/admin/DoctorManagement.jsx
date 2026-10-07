import React, { useState } from 'react';
import { Stethoscope, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { doctorService } from '../../services/doctorService';
import { formatCurrency } from '../../utils/formatters';

const DoctorManagement = () => {
  const { currentUser } = useAuth();
  const { doctors, departments, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Cardiology',
    specialization: 'Cardiology',
    qualification: 'MD, MBBS',
    experienceYears: 5,
    consultationFee: 120,
    roomNumber: 'Room 201',
    availableHours: '09:00 AM - 04:00 PM',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await doctorService.createDoctor(form, currentUser);
      refreshData();
      alert(`Doctor account for ${form.name} created successfully. Login Email: ${form.email}`);
      setIsOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', department: 'Cardiology', specialization: 'Cardiology', qualification: 'MD, MBBS', experienceYears: 5, consultationFee: 120, roomNumber: 'Room 201', availableHours: '09:00 AM - 04:00 PM' });
    } catch (err) {
      setError(err.message || 'Error creating doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this doctor account?')) {
      await doctorService.deleteDoctor(id, currentUser);
      refreshData();
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Doctor Name', render: (r) => <span className="font-bold">{r.name}</span> },
    { header: 'Email Login', accessor: 'email' },
    { header: 'Department', accessor: 'department' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Fee', render: (r) => formatCurrency(r.consultationFee) },
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Management</h2>
          <p className="text-xs text-slate-400">Register specialist doctor profiles and login accounts</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Register New Doctor
        </button>
      </div>

      <Table
        columns={columns}
        data={doctors}
        emptyTitle="No doctors registered."
        emptyDescription="Create a doctor account to enable doctor login and appointment booking."
        emptyActionLabel="Register First Doctor"
        onEmptyAction={() => setIsOpen(true)}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register New Specialist Doctor" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Doctor Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Alexander Wright"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Login Email</label>
              <input
                type="email"
                required
                placeholder="alexander@medicare360.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
              <input
                type="text"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Department</label>
              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value, specialization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                required
                value={form.consultationFee}
                onChange={e => setForm({ ...form, consultationFee: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Creating Doctor Account...' : 'Create Doctor Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorManagement;
