import React from 'react';
import { Building } from 'lucide-react';
import { useData } from '../../context/DataContext';
import PublicPageHeader from '../../components/common/PublicPageHeader';

const Departments = () => {
  const { departments } = useData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <PublicPageHeader />

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-hospital-600 bg-hospital-50 dark:bg-hospital-950/60 dark:text-hospital-400 px-3 py-1 rounded-full uppercase">Clinical Units</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">Hospital Departments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Active medical specialties in our platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dep) => (
            <div key={dep.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-hospital-50 dark:bg-hospital-950/60 text-hospital-600 dark:text-hospital-400 rounded-xl font-bold text-xs">{dep.code}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">{dep.status}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dep.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{dep.description}</p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Head: {dep.headOfDepartment || 'Unassigned'}</span>
                <Building className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Departments;
