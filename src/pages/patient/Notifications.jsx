import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { notificationService } from '../../services/notificationService';

const Notifications = () => {
  const { currentUser } = useAuth();
  const { notifications, refreshData } = useData();

  const userNotifs = notifications.filter(n => n.userId === currentUser?.id || n.userId === 'GLOBAL');

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(currentUser?.id);
    refreshData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Notifications</h2>
          <p className="text-xs text-slate-400">System notifications and event alerts</p>
        </div>
        {userNotifs.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-hospital-600" /> Mark All as Read
          </button>
        )}
      </div>

      {userNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No new notifications."
          description="System notifications will appear here when appointments are booked or updated."
        />
      ) : (
        <div className="space-y-3">
          {userNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all ${
                n.isRead
                  ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60'
                  : 'bg-hospital-50/40 dark:bg-hospital-950/30 border-hospital-200 dark:border-hospital-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 ml-4">{formatDateTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
