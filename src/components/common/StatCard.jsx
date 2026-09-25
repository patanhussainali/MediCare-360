import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'teal', subtext, trend }) => {
  const colorMap = {
    teal: 'bg-hospital-500/15 text-hospital-700 border-hospital-200 dark:bg-hospital-500/20 dark:text-hospital-300 dark:border-hospital-700',
    sage: 'bg-hospital-500/15 text-hospital-700 border-hospital-200 dark:bg-hospital-500/20 dark:text-hospital-300 dark:border-hospital-700',
    blue: 'bg-accent-500/15 text-accent-700 border-accent-200 dark:bg-accent-500/25 dark:text-accent-300 dark:border-accent-700',
    muted: 'bg-muted-teal/15 text-muted-teal border-muted-teal/20 dark:bg-muted-teal/25 dark:text-soft-sage dark:border-muted-teal/30',
    soft: 'bg-soft-sage/30 text-deep-forest border-soft-sage dark:bg-soft-sage/20 dark:text-soft-sage dark:border-soft-sage/30',
    amber: 'bg-amber-500/15 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800',
    rose: 'bg-rose-500/15 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-800',
    purple: 'bg-hospital-700/15 text-hospital-800 border-hospital-300 dark:bg-hospital-700/25 dark:text-hospital-200 dark:border-hospital-600',
  };

  const bgStyle = colorMap[color] || colorMap.teal;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700/60 transition-all hover:shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl border ${bgStyle}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center text-xs font-medium text-slate-500">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
