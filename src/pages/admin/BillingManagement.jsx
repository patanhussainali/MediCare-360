import React from 'react';
import { CreditCard } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminBillingManagement = () => {
  const { bills } = useData();

  const columns = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Subtotal', render: (r) => formatCurrency(r.subtotal) },
    { header: 'Tax (5%)', render: (r) => formatCurrency(r.tax) },
    { header: 'Total Amount', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(r.totalAmount)}</span> },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Created Date', render: (r) => formatDate(r.createdDate) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Master Hospital Financial Invoices</h2>
        <p className="text-xs text-slate-400">Hospital billing oversight and revenue tracking</p>
      </div>

      <Table
        columns={columns}
        data={bills}
        emptyTitle="No billing records available."
        emptyDescription="Generated billing invoices will appear here."
      />
    </div>
  );
};

export default AdminBillingManagement;
