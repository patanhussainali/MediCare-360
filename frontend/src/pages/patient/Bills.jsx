import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { billingService } from '../../services/billingService';
import BillInvoice from '../../components/common/BillInvoice';

const Bills = () => {
  const { currentUser } = useAuth();
  const { bills, patients, refreshData } = useData();
  const [payingBill, setPayingBill] = useState(null);
  const [viewBill, setViewBill] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '4532 •••• •••• 8821', expiry: '12/28', cvv: '882' });
  const [processing, setProcessing] = useState(false);

  const myPatient = patients.find(p => String(p.userId) === String(currentUser?.id) || String(p.patientId) === String(currentUser?.profileId) || String(p.id) === String(currentUser?.profileId));
  const myBills = bills.filter(b => String(b.patientId) === String(myPatient?.id) || String(b.patientUserId) === String(currentUser?.id));
  const classifyBill = bill => {
    const text = `${bill.description || ''} ${(bill.items || []).map(item => item.description || item.medicine_name || '').join(' ')}`.toLowerCase();
    if (text.includes('medicine') || text.includes('pharmacy') || text.includes('dispense')) return 'Medicines';
    if (text.includes('lab') || text.includes('test') || text.includes('x-ray') || text.includes('xray')) return 'Lab Tests';
    return 'Appointments';
  };
  const groupedBills = ['Appointments', 'Medicines', 'Lab Tests'].map(category => ({
    category,
    bills: myBills.filter(bill => classifyBill(bill) === category),
  }));

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payingBill) return;

    setProcessing(true);
    try {
      await billingService.processPayment(payingBill.id, { paymentMethod: 'Credit Card (Simulated)' }, currentUser);
      refreshData();
      alert(`Payment of ${formatCurrency(payingBill.totalAmount)} for Invoice #${payingBill.id} processed successfully.`);
      setPayingBill(null);
    } catch (err) {
      alert(err.message || 'Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Created Date', render: (r) => formatDate(r.createdAt || r.createdDate) },
    { header: 'Category', render: (r) => classifyBill(r) },
    { header: 'Amount', render: (r) => <span className="font-bold">{formatCurrency(r.totalAmount)}</span> },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => <div className="flex items-center gap-2">
        <button onClick={() => setViewBill(r)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold"><Eye className="mr-1 inline h-3.5 w-3.5" />Invoice</button>
        {['Pending', 'Unpaid'].includes(r.paymentStatus || r.status) ? <button onClick={() => setPayingBill(r)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all">Pay Online</button> : <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>}
      </div>
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bills & Payments</h2>
        <p className="text-xs text-slate-400">View hospital billing invoices and make online payments</p>
      </div>

      {groupedBills.map(group => <section key={group.category} className="space-y-2">
        <h3 className="font-bold text-slate-700 dark:text-slate-200">{group.category}</h3>
        <Table columns={columns} data={group.bills} emptyTitle={`No ${group.category.toLowerCase()} bills.`} emptyDescription="New invoices will appear here when issued." />
      </section>)}

      {viewBill && <Modal isOpen onClose={() => setViewBill(null)} title={`Invoice ${viewBill.invoiceNumber || `#${viewBill.id}`}`} maxWidth="max-w-2xl"><BillInvoice bill={viewBill} /></Modal>}

      {/* Payment Gateway Modal Simulator */}
      {payingBill && (
        <Modal
          isOpen={!!payingBill}
          onClose={() => setPayingBill(null)}
          title={`Pay Invoice #${payingBill.id}`}
        >
          <form onSubmit={handlePay} className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-slate-400">Total Payable Amount</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(payingBill.totalAmount)}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
              <input
                type="text"
                required
                value={cardDetails.number}
                onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                <input
                  type="text"
                  required
                  value={cardDetails.expiry}
                  onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                <input
                  type="password"
                  required
                  value={cardDetails.cvv}
                  onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-soft transition-all disabled:opacity-50 mt-2"
            >
              {processing ? 'Processing Payment...' : `Authorize Payment (${formatCurrency(payingBill.totalAmount)})`}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Bills;
