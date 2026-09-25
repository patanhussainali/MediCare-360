import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Bell,
  Stethoscope,
  Users,
  ClipboardList,
  Building,
  ShieldCheck,
  BarChart3,
  Settings,
  Search,
  HeartPulse,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'GUEST';

  const navConfig = {
    PATIENT: [
      { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patient/profile', label: 'My Profile', icon: User },
      { path: '/patient/book-appointment', label: 'Book Appointment', icon: Calendar },
      { path: '/patient/appointments', label: 'My Appointments', icon: ClipboardList },
      { path: '/patient/medical-records', label: 'Medical Records', icon: FileText },
      { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
      { path: '/patient/bills', label: 'Bills & Payments', icon: CreditCard },
      { path: '/patient/notifications', label: 'Notifications', icon: Bell },
    ],
    DOCTOR: [
      { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/doctor/profile', label: 'Doctor Profile', icon: User },
      { path: '/doctor/today-appointments', label: "Today's Appointments", icon: Calendar },
      { path: '/doctor/patient-list', label: 'My Patients', icon: Users },
      { path: '/doctor/patient-records', label: 'Medical Records', icon: FileText },
      { path: '/doctor/diagnosis', label: 'Clinical Diagnosis', icon: Stethoscope },
      { path: '/doctor/prescriptions', label: 'Issue Prescriptions', icon: Pill },
      { path: '/doctor/schedule', label: 'Schedule Management', icon: Calendar },
      { path: '/doctor/notifications', label: 'Notifications', icon: Bell },
    ],
    NURSE: [
      { path: '/nurse/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/nurse/assigned-patients', label: 'Assigned Patients', icon: Users },
      { path: '/nurse/patient-monitoring', label: 'Vitals & Monitoring', icon: HeartPulse },
      { path: '/nurse/nursing-tasks', label: 'Nursing Tasks', icon: ClipboardList },
      { path: '/nurse/notifications', label: 'Notifications', icon: Bell },
    ],
    RECEPTIONIST: [
      { path: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/receptionist/patient-registration', label: 'Patient Registration', icon: UserPlus },
      { path: '/receptionist/appointment-management', label: 'Appointments', icon: Calendar },
      { path: '/receptionist/doctor-availability', label: 'Doctor Availability', icon: Stethoscope },
      { path: '/receptionist/billing', label: 'Billing & Intake', icon: CreditCard },
      { path: '/receptionist/patient-search', label: 'Patient Search', icon: Search },
    ],
    PHARMACIST: [
      { path: '/pharmacist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/pharmacist/inventory', label: 'Medicine Inventory', icon: Pill },
      { path: '/pharmacist/prescriptions', label: 'Dispense Prescriptions', icon: FileText },
      { path: '/pharmacist/issue-records', label: 'Issue Records', icon: ClipboardList },
      { path: '/pharmacist/low-stock', label: 'Low Stock Alert', icon: Activity },
    ],
    ADMIN: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/users', label: 'User Accounts', icon: Users },
      { path: '/admin/doctors', label: 'Doctor Management', icon: Stethoscope },
      { path: '/admin/patients', label: 'Patient Management', icon: HeartPulse },
      { path: '/admin/staff', label: 'Staff Management', icon: UserPlus },
      { path: '/admin/departments', label: 'Departments', icon: Building },
      { path: '/admin/appointments', label: 'All Appointments', icon: Calendar },
      { path: '/admin/billing', label: 'Billing & Invoices', icon: CreditCard },
      { path: '/admin/pharmacy', label: 'Pharmacy Control', icon: Pill },
      { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { path: '/admin/audit-logs', label: 'System Audit Logs', icon: ShieldCheck },
      { path: '/admin/settings', label: 'System Settings', icon: Settings },
    ]
  };

  const navItems = navConfig[role] || [];

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-slate-900 text-slate-300 w-64 flex flex-col shadow-2xl border-r border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-slate-950/40">
        <div className="p-2 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-xl text-white shadow-card">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-black tracking-tight text-white text-lg leading-tight flex items-center gap-1">
            MediCare<span className="text-hospital-400 font-extrabold">360</span>
          </h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital Platform</p>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800/50 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Current Role:</span>
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-hospital-500/10 text-hospital-400 border border-hospital-500/20">
          {role}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-hospital-600 text-white shadow-soft font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 text-xs text-slate-500 text-center">
        MediCare360 &copy; 2026 Phase 1 Frontend
      </div>
    </aside>
  );
};

export default Sidebar;
