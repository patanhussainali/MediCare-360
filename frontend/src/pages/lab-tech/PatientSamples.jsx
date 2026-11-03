import React, { useState } from 'react';
import { Users, Search, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Badge from '../../components/common/Badge';
import RefreshButton from '../../components/common/RefreshButton';
import { formatDate } from '../../utils/formatters';

const PatientSamples = () => {
  const { patients, refreshData } = useData();
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = (p.name || p.full_name || '').toLowerCase();
    const id = (p.patientId || p.patient_id || String(p.id)).toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return name.includes(q) || id.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="w-7 h-7 text-teal-600" />
          Patient Samples Reference
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          View registered patients for sample collection and lab reference
        </p>
        </div>
        <RefreshButton onRefresh={refreshData} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, patient ID or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 dark:text-white"
        />
      </div>

      {/* Patients list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No patients found.</p>
            <p className="text-xs text-slate-400">Patients registered in the system will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Patient ID</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Full Name</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Gender</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Blood Group</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-teal-600">
                        {p.patientId || p.patient_id || `PAT-${p.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                      {p.name || p.full_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {p.gender || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {p.bloodGroup || p.blood_group ? (
                        <span className="font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-lg">
                          {p.bloodGroup || p.blood_group}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.phone || p.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={p.status || 'Active'} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(p.createdAt || p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSamples;
