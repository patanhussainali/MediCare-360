import React from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import { formatDateTime } from '../../utils/formatters';
import { auditService } from '../../services/auditService';

const AuditLogs = () => {
  const { auditLogs, refreshData } = useData();

  const handleClear = () => {
    if (window.confirm('Clear all system audit logs?')) {
      auditService.clearLogs();
      refreshData();
    }
  };

  const columns = [
    { header: 'Event ID', accessor: 'id' },
    { header: 'Action', render: (r) => <span className="font-bold text-hospital-600">{r.action}</span> },
    { header: 'Event Description', accessor: 'description' },
    { header: 'Triggered By', accessor: 'userName' },
    { header: 'IP Address', accessor: 'ipAddress' },
    { header: 'Timestamp', render: (r) => formatDateTime(r.timestamp) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Security & Audit Logs</h2>
          <p className="text-xs text-slate-400">Immutable audit event logs recorded for system accountability</p>
        </div>
        {auditLogs.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear Audit Logs
          </button>
        )}
      </div>

      <Table
        columns={columns}
        data={auditLogs}
        emptyTitle="No audit logs recorded yet."
        emptyDescription="System actions (logins, account creations, record updates) will record audit logs here."
      />
    </div>
  );
};

export default AuditLogs;
