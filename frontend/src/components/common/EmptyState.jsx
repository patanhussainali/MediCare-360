import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no active records in the system database for this selection.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 my-4 shadow-sm">
      <div className="p-4 bg-hospital-50 text-hospital-600 dark:bg-slate-700/60 dark:text-hospital-400 rounded-full mb-4 ring-8 ring-hospital-50/50 dark:ring-slate-800">
        <Icon className="w-10 h-10" />
      </div>
      <h4 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-medium text-sm rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
