import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, AlertTriangle, CheckCircle2, Package, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';

const PharmacyDashboard = () => {
  const { currentUser } = useAuth();
  const { medicines, prescriptions, stats } = useData();

  const lowStockItems = medicines.filter(m => (m.stockQuantity || 0) <= (m.minThreshold || 10));
  const pendingDispense = prescriptions.filter(p => p.status === 'Pending');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-700 to-hospital-800 text-white p-6 md:p-8 rounded-3xl shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">Pharmacy & Inventory Portal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Welcome, Pharmacist {currentUser?.name}</h2>
          <p className="text-xs md:text-sm text-purple-100 mt-1">Drug Inventory Management & Prescription Dispensing Center</p>
        </div>
        <Link
          to="/pharmacist/inventory"
          className="px-4 py-2.5 bg-white text-purple-800 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-soft flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </Link>
      </div>

      {/* Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Medicine Items" value={stats.totalMedicines} icon={Pill} color="purple" subtext="Unique catalog items" />
        <StatCard title="Total Stock Units" value={stats.availableMedicines} icon={Package} color="teal" subtext="Available in stock" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockMedicines} icon={AlertTriangle} color="amber" subtext="Below minimum threshold" />
        <StatCard title="Pending Dispense" value={pendingDispense.length} icon={CheckCircle2} color="rose" subtext="Awaiting pharmacist" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Dispense Queue */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Pending Prescriptions Queue</h3>
            <Link to="/pharmacist/prescriptions" className="text-xs font-bold text-hospital-600 hover:underline">Dispense Desk</Link>
          </div>

          {pendingDispense.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No pending prescriptions in queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {pendingDispense.map(p => (
                <div key={p.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">RX #{p.id} &bull; {p.patientName}</p>
                    <p className="text-slate-400">Prescribed by {p.doctorName} &bull; {p.medicines?.length || 0} items</p>
                  </div>
                  <Link
                    to="/pharmacist/prescriptions"
                    className="px-3 py-1.5 bg-hospital-600 text-white font-bold rounded-xl text-xs hover:bg-hospital-700"
                  >
                    Dispense
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Low Stock Warning Alert</h3>
            <Link to="/pharmacist/low-stock" className="text-xs font-bold text-amber-600 hover:underline">View All</Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-600 font-medium bg-emerald-50/40 rounded-2xl border border-emerald-200">
              All inventory stock levels are healthy above threshold!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {lowStockItems.map(m => (
                <div key={m.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{m.name} ({m.dosage})</p>
                    <p className="text-slate-400">Manufacturer: {m.manufacturer}</p>
                  </div>
                  <span className="font-black text-rose-600 px-3 py-1 bg-rose-50 rounded-lg border border-rose-200">
                    {m.stockQuantity} units left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
