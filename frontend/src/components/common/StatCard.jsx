import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'teal', subtext, trend }) => {
  const colorMap = {
    teal:   'bg-hospital-500/15 text-hospital-700 border-hospital-200 dark:bg-hospital-500/20 dark:text-hospital-300 dark:border-hospital-700',
    sage:   'bg-hospital-500/15 text-hospital-700 border-hospital-200 dark:bg-hospital-500/20 dark:text-hospital-300 dark:border-hospital-700',
    blue:   'bg-blue-500/15 text-blue-700 border-blue-200 dark:bg-blue-500/25 dark:text-blue-300 dark:border-blue-700',
    muted:  'bg-slate-500/10 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-600',
    soft:   'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600',
    amber:  'bg-amber-500/15 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800',
    rose:   'bg-rose-500/15 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-800',
    purple: 'bg-purple-500/15 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800',
  };

  const bgStyle = colorMap[color] || colorMap.teal;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft border border-slate-100 dark:border-slate-700/60 transition-all hover:shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border shrink-0 ${bgStyle}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center text-xs font-medium text-slate-500">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
