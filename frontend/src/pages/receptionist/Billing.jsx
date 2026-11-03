import React, { useState } from 'react';
import { CreditCard, Plus, CheckCircle2, Eye } from 'lucide-react';
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

  const [isOpen, setIsOpen]           = useState(false);
  const [detailBill, setDetailBill]   = useState(null);
  const [patientId, setPatientId]     = useState('');
  const [description, setDescription] = useState('Outpatient Consultation & Intake Fee');
  const [amount, setAmount]           = useState(150.00);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    if (!patientId) return setError('Please select a patient.');
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount.');

    setLoading(true);
    try {
      await billingService.createBill({
        patientId: Number(patientId),   // numeric DB PK
        description,
        amount: parseFloat(amount),
      }, currentUser);

      await refreshData();
      setIsOpen(false);
      setPatientId('');
      setDescription('Outpatient Consultation & Intake Fee');
      setAmount(150.00);
    } catch (err) {
      setError(err.message || 'Error generating bill');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (bill) => {
    try {
      await billingService.processPayment(bill.id, { paymentMethod: 'Cash' }, currentUser);
      await refreshData();
    } catch (err) {
      alert(err.message || 'Failed to mark as paid');
    }
  };

  const columns = [
    {
      header: 'Invoice ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-hospital-600">
          {r.invoiceNumber || r.id}
        </span>
      )
    },
    { header: 'Patient Name', render: (r) => r.patientName || '—' },
    {
      header: 'Total Amount',
      render: (r) => <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(r.totalAmount)}</span>
    },
    { header: 'Status', render: (r) => <Badge status={r.paymentStatus || r.status} /> },
    { header: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailBill(r)}
            className="p-1.5 text-slate-500 hover:text-hospital-600 hover:bg-hospital-50 rounded-lg transition"
            title="View invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(r.paymentStatus === 'Pending' || r.status === 'Pending') && (
            <button
              onClick={() => handleMarkPaid(r)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Intake Billing & Invoice Desk</h2>
          <p className="text-xs text-slate-400">Generate consultation invoices and collect payments</p>
        </div>
        <button
          onClick={() => { setIsOpen(true); setError(''); }}
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

      {/* Invoice Detail Modal */}
      {detailBill && (
        <Modal isOpen={!!detailBill} onClose={() => setDetailBill(null)}
          title={`Invoice — ${detailBill.invoiceNumber || detailBill.id}`}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Patient</p>
                <p className="font-bold text-slate-800 dark:text-white">{detailBill.patientName}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Status</p>
                <Badge status={detailBill.paymentStatus || detailBill.status} />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Subtotal</p>
                <p className="font-semibold">{formatCurrency(detailBill.subtotal)}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-slate-400 mb-0.5">Tax</p>
                <p className="font-semibold">{formatCurrency(detailBill.tax)}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl col-span-2">
                <p className="text-emerald-600 text-[11px] font-bold mb-0.5">TOTAL DUE</p>
                <p className="text-2xl font-extrabold text-emerald-700">{formatCurrency(detailBill.totalAmount)}</p>
              </div>
            </div>
            {detailBill.description && (
              <p className="text-slate-500 text-[11px]">Description: {detailBill.description}</p>
            )}
            {(detailBill.paymentStatus === 'Pending' || detailBill.status === 'Pending') && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { handleMarkPaid(detailBill); setDetailBill(null); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Collect Payment
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Generate Invoice Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Generate Patient Billing Invoice"
        footer={
          <>
            <button type="button" onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" form="billForm" disabled={loading}
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </>
        }
      >
        <form id="billForm" onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
            <select required value={patientId} onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <option value="">— Choose Patient —</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.full_name} ({p.patientId || p.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Description *</label>
            <input type="text" required value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Amount (INR) *</label>
            <input type="number" step="0.01" min="1" required value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
            <p className="text-[10px] text-slate-400 mt-1">5% tax will be added automatically.</p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistBilling;
