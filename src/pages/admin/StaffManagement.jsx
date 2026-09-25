import React, { useState } from 'react';
import { UserPlus, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { staffService } from '../../services/staffService';

const StaffManagement = () => {
  const { currentUser } = useAuth();
  const { nurses, receptionists, pharmacists, departments, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState('NURSE');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Staff@123',
    phone: '',
    department: 'General Healthcare',
    shift: 'Day Shift (08:00 AM - 04:00 PM)',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allStaff = [
    ...nurses.map(n => ({ ...n, staffRole: 'NURSE' })),
    ...receptionists.map(r => ({ ...r, staffRole: 'RECEPTIONIST' })),
    ...pharmacists.map(p => ({ ...p, staffRole: 'PHARMACIST' })),
  ];

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await staffService.createStaffMember({ ...form, role }, currentUser);
      refreshData();
      alert(`${role} account for ${form.name} created. Email: ${form.email}`);
      setIsOpen(false);
      setForm({ name: '', email: '', password: 'Staff@123', phone: '', department: 'General Healthcare', shift: 'Day Shift' });
    } catch (err) {
      setError(err.message || 'Error creating staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, staffRole) => {
    if (window.confirm(`Delete ${staffRole} staff account?`)) {
      await staffService.deleteStaffMember(id, staffRole, currentUser);
      refreshData();
    }
  };

  const columns = [
    { header: 'Staff ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email Login', accessor: 'email' },
    {
      header: 'Staff Role',
      render: (r) => (
        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border">
          {r.staffRole || r.role}
        </span>
      )
    },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <button onClick={() => handleDelete(r.id, r.staffRole || r.role)} className="text-rose-600 hover:text-rose-800">
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Management Control</h2>
          <p className="text-xs text-slate-400">Manage Nurse, Receptionist, and Pharmacist hospital staff</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <Table
        columns={columns}
        data={allStaff}
        emptyTitle="No staff accounts registered."
        emptyDescription="Create Nurse, Receptionist, or Pharmacist accounts to grant operational access."
        emptyActionLabel="Create First Staff Account"
        onEmptyAction={() => setIsOpen(true)}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Hospital Staff Account">
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Staff Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['NURSE', 'RECEPTIONIST', 'PHARMACIST'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    role === r ? 'bg-hospital-600 text-white border-hospital-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Full Name</label>
              <input
                type="text"
                required
                placeholder="Sarah Jenkins"
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
                placeholder="sarah@medicare360.com"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Creating Account...' : `Create ${role} Account`}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
