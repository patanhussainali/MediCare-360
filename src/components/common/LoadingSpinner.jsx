import React from 'react';
import { Activity } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="p-3 bg-hospital-50 text-hospital-600 dark:bg-slate-800 rounded-2xl animate-spin ring-4 ring-hospital-50">
        <Activity className="w-8 h-8" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
