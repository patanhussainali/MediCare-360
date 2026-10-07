import React, { useState } from 'react';
import { CreditCard, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { billingService } from '../../services/billingService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ReceptionistBilling = () => {
  const { currentUser } = useAuth();
  const { bills, patients, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [description, setDescription] = useState('Outpatient Consultation & Intake Fee');
  const [amount, setAmount] = useState(150.00);
  const [loading, setLoading] = useState(false);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!patientId || !amount) return alert('Select patient and enter amount');

    setLoading(true);
    try {
      const pat = patients.find(p => p.id === patientId);
      await billingService.createBill({
        patientId: pat.id,
        patientName: pat.name,
        description,
        amount: parseFloat(amount),
      }, currentUser);

      refreshData();
      alert('Invoice generated successfully.');
      setIsOpen(false);
    } catch (err) {
      alert(err.message || 'Error generating bill');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Total Amount', render: (r) => <span className="font-bold">{formatCurrency(r.totalAmount)}</span> },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Created Date', render: (r) => formatDate(r.createdDate) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Intake Billing & Invoice Desk</h2>
          <p className="text-xs text-slate-400">Generate consultation invoices and collect payments</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Generate New Bill
        </button>
      </div>

      <Table
        columns={columns}
        data={bills}
        emptyTitle="No billing records available."
        emptyDescription="Billing invoices generated for patients will appear here."
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Generate Patient Billing Invoice">
        <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
            <select
              required
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Generating...' : 'Generate Invoice'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistBilling;
