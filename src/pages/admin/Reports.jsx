import React from 'react';
import { BarChart3, PieChart, Activity, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';

const Reports = () => {
  const { stats, appointments, doctors, bills, medicines } = useData();

  const hasData = stats.totalAppointments > 0 || stats.totalPatients > 0 || stats.totalBills > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hospital Operational Reports & Analytics</h2>
        <p className="text-xs text-slate-400">Real-time analytical insights calculated from stored system records</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No operational data available for reports"
          description="Reports and analytics are calculated dynamically from actual system records. Once doctors, patients, appointments, and bills are created in the platform, real-time visual charts will render here automatically."
        />
      ) : (
        <div className="space-y-8">
          {/* Revenue Breakdown */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Financial Summary Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-hospital-50 dark:bg-hospital-950/40 rounded-2xl border border-hospital-200 dark:border-hospital-800">
                <span className="text-xs text-hospital-700 dark:text-hospital-400 font-bold">Total Collected Revenue</span>
                <p className="text-3xl font-black text-hospital-900 dark:text-hospital-200 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-[11px] text-hospital-600 mt-1">From {stats.totalBills - stats.pendingBills} paid invoices</p>
              </div>

              <div className="p-4 bg-soft-sage/30 dark:bg-slate-900/60 rounded-2xl border border-soft-sage dark:border-slate-700">
                <span className="text-xs text-deep-forest dark:text-soft-sage font-bold">Pending Outstanding Revenue</span>
                <p className="text-3xl font-black text-deep-forest dark:text-soft-sage mt-1">{formatCurrency(stats.pendingRevenue)}</p>
                <p className="text-[11px] text-muted-teal dark:text-slate-400 mt-1">From {stats.pendingBills} pending invoices</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Invoices Generated</span>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalBills}</p>
                <p className="text-[11px] text-slate-400 mt-1">Master billing count</p>
              </div>
            </div>
          </div>

          {/* Appointments Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Appointments Status Distribution</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Scheduled / Pending</span>
                    <span>{stats.pendingAppointments} ({stats.totalAppointments ? Math.round((stats.pendingAppointments / stats.totalAppointments) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-muted-teal h-full" style={{ width: `${stats.totalAppointments ? (stats.pendingAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Completed Visits</span>
                    <span>{stats.completedAppointments} ({stats.totalAppointments ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-hospital-500 h-full" style={{ width: `${stats.totalAppointments ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Cancelled</span>
                    <span>{stats.cancelledAppointments} ({stats.totalAppointments ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${stats.totalAppointments ? (stats.cancelledAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Pharmacy Inventory Health</h3>
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Total Drug Stock Units</span>
                    <p className="text-slate-400">{stats.totalMedicines} medicine catalog items</p>
                  </div>
                  <span className="text-2xl font-black text-hospital-600">{stats.availableMedicines}</span>
                </div>

                <div className="p-4 bg-soft-sage/30 dark:bg-slate-900/60 rounded-2xl border border-soft-sage dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-deep-forest dark:text-soft-sage">Low Stock Alert Items</span>
                    <p className="text-muted-teal dark:text-slate-400 text-[11px]">Requires stock replenishment</p>
                  </div>
                  <span className="text-2xl font-black text-muted-teal dark:text-soft-sage">{stats.lowStockMedicines}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
