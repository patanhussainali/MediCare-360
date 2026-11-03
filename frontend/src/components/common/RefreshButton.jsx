import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const RefreshButton = ({ onRefresh, label = 'Refresh this section', className = '' }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      else window.dispatchEvent(new CustomEvent('medicare360_refresh_data'));
    } finally {
      window.setTimeout(() => setRefreshing(false), 350);
    }
  };

  return (
    <button type="button" onClick={handleRefresh} disabled={refreshing} aria-label={label} title={label}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 ${className}`}>
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
    </button>
  );
};

export default RefreshButton;
