import React, { useState } from 'react';
import { Users, Lock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { refreshData } = useData();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getAllUsers();
    setUsersList(res.data || []);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    await userService.updateUserStatus(user.id, newStatus, currentUser);
    fetchUsers();
    refreshData();
  };

  const columns = [
    { header: 'User ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email Address', accessor: 'email' },
    {
      header: 'Assigned Role',
      render: (r) => (
        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border">
          {r.role}
        </span>
      )
    },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Created Date', render: (r) => formatDate(r.createdAt) },
    {
      header: 'Actions',
      render: (r) => r.role === 'ADMIN' && r.id === currentUser?.id ? (
        <span className="text-xs text-slate-400">Current Session</span>
      ) : (
        <button
          onClick={() => handleToggleStatus(r)}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
            r.status === 'Active'
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          {r.status === 'Active' ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Master User Accounts Control</h2>
        <p className="text-xs text-slate-400">Manage login credentials, role assignments, and active account status</p>
      </div>

      <Table
        columns={columns}
        data={usersList}
        emptyTitle="No operational users found."
        emptyDescription="User accounts created by the administrator will appear here."
      />
    </div>
  );
};

export default UserManagement;
