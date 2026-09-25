import React, { useState } from 'react';
import { Pill, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { pharmacyService } from '../../services/pharmacyService';
import { formatCurrency } from '../../utils/formatters';

const MedicineInventory = () => {
  const { currentUser } = useAuth();
  const { medicines, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stockEditQty, setStockEditQty] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'Analgesic / Antibiotic',
    dosageForm: 'Tablet',
    dosage: '500mg',
    unitPrice: 15.00,
    stockQuantity: 100,
    minThreshold: 15,
    manufacturer: 'Pharma Care Ltd',
  });

  const [loading, setLoading] = useState(false);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pharmacyService.addMedicine(form, currentUser);
      refreshData();
      alert('Medicine added to inventory.');
      setIsOpen(false);
      setForm({ name: '', category: 'General', dosageForm: 'Tablet', dosage: '500mg', unitPrice: 15.00, stockQuantity: 100, minThreshold: 15, manufacturer: 'Pharma Care' });
    } catch (err) {
      alert(err.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (id) => {
    if (!stockEditQty) return;
    await pharmacyService.updateMedicineStock(id, stockEditQty, currentUser);
    refreshData();
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete medicine item from inventory?')) {
      await pharmacyService.deleteMedicine(id, currentUser);
      refreshData();
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Medicine Name', render: (r) => <span className="font-bold">{r.name} ({r.dosage})</span> },
    { header: 'Category', accessor: 'category' },
    { header: 'Form', accessor: 'dosageForm' },
    { header: 'Unit Price', render: (r) => formatCurrency(r.unitPrice) },
    {
      header: 'Stock Qty',
      render: (r) => editingId === r.id ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={stockEditQty}
            onChange={e => setStockEditQty(e.target.value)}
            className="w-16 px-2 py-1 bg-white border rounded text-xs"
          />
          <button onClick={() => handleUpdateQty(r.id)} className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]">Save</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`font-black ${r.stockQuantity <= r.minThreshold ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
            {r.stockQuantity} units
          </span>
          <button onClick={() => { setEditingId(r.id); setStockEditQty(r.stockQuantity); }} className="text-hospital-600">
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pharmacy Medicine Inventory</h2>
          <p className="text-xs text-slate-400">Master stock inventory catalog and pricing</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      <Table
        columns={columns}
        data={medicines}
        emptyTitle="No medicines available."
        emptyDescription="Inventory items added by the pharmacist will appear here."
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Medicine to Stock">
        <form onSubmit={handleAddMedicine} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medicine Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Paracetamol"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage Form</label>
              <select
                value={form.dosageForm}
                onChange={e => setForm({ ...form, dosageForm: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage Strength</label>
              <input
                type="text"
                required
                value={form.dosage}
                onChange={e => setForm({ ...form, dosage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                required
                value={form.stockQuantity}
                onChange={e => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Adding...' : 'Add Medicine Item'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MedicineInventory;
