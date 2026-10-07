import React, { useState } from 'react';
import { Building, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { departmentService } from '../../services/departmentService';

const DepartmentManagement = () => {
  const { currentUser } = useAuth();
  const { departments, doctors, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', headOfDepartment: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await departmentService.addDepartment(form, currentUser);
      refreshData();
      alert('Department added.');
      setIsOpen(false);
      setForm({ name: '', code: '', description: '', headOfDepartment: '' });
    } catch (err) {
      alert(err.message || 'Error adding department');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Dep Code', render: (r) => <span className="font-bold text-hospital-600">{r.code}</span> },
    { header: 'Department Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Head of Department', render: (r) => r.headOfDepartment || 'Unassigned' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hospital Clinical Departments</h2>
          <p className="text-xs text-slate-400">Manage clinical specialties, department codes, and department heads</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <Table
        columns={columns}
        data={departments}
        emptyTitle="No departments found."
        emptyDescription="Clinical departments will appear here."
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Hospital Clinical Department">
        <form onSubmit={handleAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dermatology"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department Code</label>
            <input
              type="text"
              required
              placeholder="e.g. DERM"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Adding...' : 'Add Department'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
