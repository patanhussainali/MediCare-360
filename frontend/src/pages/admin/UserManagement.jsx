import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, KeyRound, Edit, Trash2, Shield,
  Stethoscope, HeartPulse, UserCheck, Pill, FlaskConical,
  User, CheckCircle2, XCircle, Search, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

const ROLE_OPTIONS = [
  { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'NURSE', label: 'Nurse', icon: HeartPulse, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'RECEPTIONIST', label: 'Receptionist', icon: UserCheck, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'PHARMACIST', label: 'Pharmacist', icon: Pill, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'LAB_TECHNICIAN', label: 'Lab Technician', icon: FlaskConical, color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { id: 'ADMIN', label: 'Administrator', icon: Shield, color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'PATIENT', label: 'Patient', icon: User, color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
];

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { departments, refreshData } = useData();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DOCTOR',
    department: 'Cardiology',
    phone: '',
    status: 'Active',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'DOCTOR',
    department: '',
    phone: '',
  });

  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      setUsersList(res.data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChangeInCreate = (newRole) => {
    const roleCapital = newRole.charAt(0) + newRole.slice(1).toLowerCase();
    setCreateForm({
      ...createForm,
      role: newRole,
      password: `${roleCapital}@123`
    });
  };

  // 1. Create New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await userService.createUser(createForm, currentUser);
      setSuccessMsg(`User ${createForm.name} created successfully with role ${createForm.role}.`);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'DOCTOR',
        department: 'Cardiology',
        phone: '',
        status: 'Active',
      });
      fetchUsers();
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  // 2. Open Edit User Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
    });
    setError('');
    setIsEditOpen(true);
  };

  // 3. Save Edit User & Role Change
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await userService.updateUser(selectedUser.id, editForm, currentUser);
      setSuccessMsg(`User ${editForm.name} updated successfully.`);
      setIsEditOpen(false);
      fetchUsers();
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  // 4. Open Reset Password Modal
  const openResetPassModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setError('');
    setIsResetPassOpen(true);
  };

  // 5. Save Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await userService.resetUserPassword(selectedUser.id, newPassword, currentUser);
      setSuccessMsg(`Password reset successfully for ${selectedUser.email}.`);
      setIsResetPassOpen(false);
      setNewPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  // 6. Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (user) => {
    setError('');
    setSuccessMsg('');
    try {
      const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      await userService.updateUserStatus(user.id, nextStatus, currentUser);
      setSuccessMsg(`Status for ${user.name} changed to ${nextStatus}.`);
      fetchUsers();
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to change status');
    }
  };

  // 7. Delete User
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to permanently delete account for ${user.name} (${user.email})?`)) {
      try {
        await userService.deleteUser(user.id, currentUser);
        setSuccessMsg(`User ${user.name} was removed from the system.`);
        fetchUsers();
        refreshData();
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Stats calculation
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.status === 'Active').length;
  const doctorCount = usersList.filter(u => u.role === 'DOCTOR').length;
  const staffCount = usersList.filter(u => ['NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN'].includes(u.role)).length;

  // Filtered list
  const filteredUsers = usersList.filter(u => {
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const columns = [
    {
      header: 'User ID',
      accessor: 'id',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.id}</span>
    },
    {
      header: 'Full Name',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-white block">{r.name}</span>
          <span className="text-[11px] text-slate-400">{r.phone || 'No phone'}</span>
        </div>
      )
    },
    {
      header: 'Email Address / Username',
      render: (r) => (
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {r.email}
        </span>
      )
    },
    {
      header: 'Assigned Role',
      render: (r) => {
        const option = ROLE_OPTIONS.find(o => o.id === r.role) || { label: r.role, color: 'bg-slate-100 text-slate-700' };
        return (
          <span className={`inline-flex items-center gap-1 font-extrabold text-[11px] uppercase px-2.5 py-1 rounded-full border ${option.color}`}>
            {r.role}
          </span>
        );
      }
    },
    {
      header: 'Department',
      render: (r) => <span className="text-slate-600 dark:text-slate-300 text-xs">{r.department || 'N/A'}</span>
    },
    {
      header: 'Status',
      render: (r) => <Badge status={r.status} />
    },
    {
      header: 'Created Date',
      render: (r) => formatDate(r.createdAt)
    },
    {
      header: 'Actions',
      render: (r) => {
        const isSelf = r.id === currentUser?.id;
        return (
          <div className="flex items-center gap-1.5">
            {/* Edit details & change role */}
            <button
              onClick={() => openEditModal(r)}
              title="Edit User & Change Role"
              className="p-1.5 text-hospital-600 hover:text-hospital-800 hover:bg-hospital-50 dark:hover:bg-hospital-900/40 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Reset Password */}
            <button
              onClick={() => openResetPassModal(r)}
              title="Reset Password"
              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Toggle Status */}
            {isSelf ? (
              <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                Self
              </span>
            ) : (
              <button
                onClick={() => handleToggleStatus(r)}
                title={r.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  r.status === 'Active'
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}
              >
                {r.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            )}

            {/* Delete Account */}
            {!isSelf && (
              <button
                onClick={() => handleDeleteUser(r)}
                title="Delete User"
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-hospital-600" />
            Role-Based User Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centralized credential authority: Create accounts, assign roles, reset passwords, and toggle operational access
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setError('');
              setIsCreateOpen(true);
            }}
            className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Create New User Account
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900 font-bold">Dismiss</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total User Accounts"
          value={totalUsers}
          icon={Users}
          color="blue"
          trend={`${totalUsers} registered in database`}
        />
        <StatCard
          title="Active Operational"
          value={activeUsers}
          icon={CheckCircle2}
          color="emerald"
          trend="Authorized login enabled"
        />
        <StatCard
          title="Specialist Doctors"
          value={doctorCount}
          icon={Stethoscope}
          color="teal"
          trend="Clinical practitioners"
        />
        <StatCard
          title="Hospital Staff"
          value={staffCount}
          icon={HeartPulse}
          color="purple"
          trend="Nurses, reception, pharma"
        />
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-hospital-600 text-white shadow-soft'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Roles ({totalUsers})
            </button>
            {ROLE_OPTIONS.map((r) => {
              const count = usersList.filter(u => u.role === r.id).length;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleFilter(r.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    selectedRoleFilter === r.id
                      ? 'bg-hospital-600 text-white shadow-soft'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-hospital-500 text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        emptyTitle="No matching user accounts found."
        emptyDescription="Create a user account or adjust your role filter."
        emptyActionLabel="Create User Account"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      {/* ── MODAL 1: Create New User ── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Account (Assign Role & Credentials)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Role Assignment <span className="text-hospital-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLE_OPTIONS.map((r) => {
                const isSelected = createForm.role === r.id;
                const IconComponent = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChangeInCreate(r.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-hospital-600 bg-hospital-50 dark:bg-hospital-950/30 text-hospital-800 dark:text-hospital-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0 text-hospital-600" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name <span className="text-hospital-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={createForm.role === 'DOCTOR' ? 'Dr. Alexander Wright' : 'Sarah Jenkins'}
                value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Login Email Address / Username <span className="text-hospital-600">*</span>
              </label>
              <input
                type="email"
                required
                placeholder={`${createForm.role.toLowerCase()}@hospital.com`}
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Password <span className="text-hospital-600">*</span>
              </label>
              <input
                type="text"
                required
                value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Password will be cryptographically hashed upon creation.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={createForm.phone}
                onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Department
              </label>
              <select
                value={createForm.department}
                onChange={e => setCreateForm({ ...createForm, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
                <option value="Executive Administration">Executive Administration</option>
                <option value="General Healthcare">General Healthcare</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Diagnostics Lab">Diagnostics Lab</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Status
              </label>
              <select
                value={createForm.status}
                onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Active">Active (Immediate Login Granted)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-soft"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 2: Edit User & Change Role ── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit User Details & Role: ${selectedUser?.name || ''}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Role (Permissions take effect immediately)
            </label>
            <select
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
            >
              {ROLE_OPTIONS.map(r => (
                <option key={r.id} value={r.id}>{r.label} ({r.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={editForm.department}
                onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-soft"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 3: Reset Password ── */}
      <Modal
        isOpen={isResetPassOpen}
        onClose={() => setIsResetPassOpen(false)}
        title={`Reset Password for ${selectedUser?.name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              Assign a new password for <span className="font-semibold text-slate-800 dark:text-white">{selectedUser?.email}</span>.
              The password will be hashed with cryptographic salt.
            </p>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Secure Password</label>
            <input
              type="text"
              required
              placeholder="Enter at least 6 characters..."
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResetPassOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-soft"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
