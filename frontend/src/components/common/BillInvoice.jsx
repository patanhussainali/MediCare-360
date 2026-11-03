import React from 'react';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BillInvoice = ({ bill, onMarkPaid, busy = false }) => {
  if (!bill) return null;
  const items = Array.isArray(bill.items) ? bill.items : [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 print:rounded-none print:border-0 print:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-hospital-600">MediCare360 Invoice</p>
          <h3 className="mt-1 text-lg font-bold">{bill.invoiceNumber || `INV-${bill.id}`}</h3>
          <p className="mt-1 text-xs text-slate-500">{bill.patientName} · {formatDate(bill.createdAt)}</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs font-bold">{bill.paymentStatus || bill.status || 'Pending'}</span>
      </div>
      <p className="mb-3 text-sm font-semibold">{bill.description || 'Hospital services'}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="py-2">Item</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>
            {(items.length ? items : [{ description: bill.description, quantity: 1, amount: bill.subtotal }]).map((item, index) => {
              const quantity = Number(item.quantity || 1);
              const amount = Number(item.amount ?? item.total ?? ((Number(item.unit_price ?? item.unitPrice ?? 0)) * quantity));
              return <tr key={`${item.description || item.medicine_name || 'item'}-${index}`} className="border-b border-slate-100 dark:border-slate-700"><td className="py-2">{item.description || item.medicine_name || item.medicineName || 'Service'}</td><td className="py-2 text-right">{quantity}</td><td className="py-2 text-right">{formatCurrency(item.unit_price ?? item.unitPrice ?? amount / quantity)}</td><td className="py-2 text-right">{formatCurrency(amount)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
        <p className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(bill.subtotal)}</strong></p>
        <p className="flex justify-between"><span>Tax</span><strong>{formatCurrency(bill.tax)}</strong></p>
        <p className="flex justify-between border-t pt-2 text-base"><span>Total</span><strong>{formatCurrency(bill.totalAmount)}</strong></p>
      </div>
      <div className="mt-4 flex justify-end gap-2 print:hidden">
        {onMarkPaid && (bill.paymentStatus || bill.status) !== 'Paid' && <button type="button" disabled={busy} onClick={() => onMarkPaid(bill)} className="rounded-xl bg-hospital-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Mark Paid'}</button>}
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700"><Printer className="h-4 w-4" /> Print</button>
      </div>
    </section>
  );
};

export default BillInvoice;
