import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const LowStockMedicines = () => {
  const { medicines } = useData();

  const lowStock = medicines.filter(m => (m.stockQuantity || 0) <= (m.minThreshold || 10));

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Medicine Name', accessor: 'name' },
    { header: 'Dosage', accessor: 'dosage' },
    { header: 'Manufacturer', accessor: 'manufacturer' },
    { header: 'Current Stock', render: (r) => <span className="font-bold text-rose-600">{r.stockQuantity} units</span> },
    { header: 'Min Threshold', accessor: 'minThreshold' },
    { header: 'Status', render: (r) => <Badge status="Low Stock" /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Low Stock Inventory Alerts</h2>
        <p className="text-xs text-slate-400">Medicines running below required minimum stock thresholds</p>
      </div>

      <Table
        columns={columns}
        data={lowStock}
        emptyTitle="No low stock alerts."
        emptyDescription="All inventory stock items are currently above threshold levels."
      />
    </div>
  );
};

export default LowStockMedicines;
