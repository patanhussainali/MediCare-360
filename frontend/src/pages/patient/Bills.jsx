import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { billingService } from '../../services/billingService';

const Bills = () => {
  const { currentUser } = useAuth();
  const { bills, refreshData } = useData();
  const [payingBill, setPayingBill] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '4532 •••• •••• 8821', expiry: '12/28', cvv: '882' });
  const [processing, setProcessing] = useState(false);

  const myBills = bills.filter(b => b.patientUserId === currentUser?.id || b.patientId === currentUser?.profileId);

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
    { header: 'Created Date', render: (r) => formatDate(r.createdDate) },
    { header: 'Due Date', render: (r) => formatDate(r.dueDate) },
    { header: 'Amount', render: (r) => <span className="font-bold">{formatCurrency(r.totalAmount)}</span> },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => r.status === 'Pending' || r.status === 'Unpaid' ? (
        <button
          onClick={() => setPayingBill(r)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all"
        >
          Pay Online
        </button>
      ) : (
        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bills & Payments</h2>
        <p className="text-xs text-slate-400">View hospital billing invoices and make online payments</p>
      </div>

      <Table
        columns={columns}
        data={myBills}
        emptyTitle="No billing records available."
        emptyDescription="Billing invoices generated for hospital services will appear here."
      />

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
