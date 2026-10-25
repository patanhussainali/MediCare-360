import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, LayoutDashboard, User, Calendar, FileText, Pill,
  CreditCard, Bell, Stethoscope, Users, ClipboardList, Building,
  ShieldCheck, BarChart3, Settings, Search, HeartPulse, UserPlus,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, collapsed, toggleSidebar, toggleCollapse, sidebarW }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'GUEST';

  const navConfig = {
    PATIENT: [
      { path: '/patient/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
      { path: '/patient/profile',          label: 'My Profile',       icon: User },
      { path: '/patient/book-appointment', label: 'Book Appointment', icon: Calendar },
      { path: '/patient/appointments',     label: 'My Appointments',  icon: ClipboardList },
      { path: '/patient/medical-records',  label: 'Medical Records',  icon: FileText },
      { path: '/patient/prescriptions',    label: 'Prescriptions',    icon: Pill },
      { path: '/patient/bills',            label: 'Bills & Payments',  icon: CreditCard },
      { path: '/patient/notifications',    label: 'Notifications',    icon: Bell },
    ],
    DOCTOR: [
      { path: '/doctor/dashboard',           label: 'Dashboard',            icon: LayoutDashboard },
      { path: '/doctor/profile',             label: 'Doctor Profile',        icon: User },
      { path: '/doctor/today-appointments',  label: "Today's Appointments", icon: Calendar },
      { path: '/doctor/patient-list',        label: 'My Patients',           icon: Users },
      { path: '/doctor/patient-records',     label: 'Medical Records',       icon: FileText },
      { path: '/doctor/diagnosis',           label: 'Clinical Diagnosis',    icon: Stethoscope },
      { path: '/doctor/prescriptions',       label: 'Issue Prescriptions',   icon: Pill },
      { path: '/doctor/schedule',            label: 'Schedule Management',   icon: Calendar },
      { path: '/doctor/notifications',       label: 'Notifications',         icon: Bell },
    ],
    NURSE: [
      { path: '/nurse/dashboard',           label: 'Dashboard',          icon: LayoutDashboard },
      { path: '/nurse/assigned-patients',   label: 'Assigned Patients',  icon: Users },
      { path: '/nurse/patient-monitoring',  label: 'Vitals & Monitoring', icon: HeartPulse },
      { path: '/nurse/nursing-tasks',       label: 'Nursing Tasks',      icon: ClipboardList },
      { path: '/nurse/notifications',       label: 'Notifications',      icon: Bell },
    ],
    RECEPTIONIST: [
      { path: '/receptionist/dashboard',              label: 'Dashboard',           icon: LayoutDashboard },
      { path: '/receptionist/patient-registration',   label: 'Patient Registration', icon: UserPlus },
      { path: '/receptionist/appointment-management', label: 'Appointments',         icon: Calendar },
      { path: '/receptionist/doctor-availability',    label: 'Doctor Availability',  icon: Stethoscope },
      { path: '/receptionist/billing',                label: 'Billing & Intake',     icon: CreditCard },
      { path: '/receptionist/patient-search',         label: 'Patient Search',       icon: Search },
    ],
    PHARMACIST: [
      { path: '/pharmacist/dashboard',     label: 'Dashboard',             icon: LayoutDashboard },
      { path: '/pharmacist/inventory',     label: 'Medicine Inventory',    icon: Pill },
      { path: '/pharmacist/prescriptions', label: 'Dispense Prescriptions', icon: FileText },
      { path: '/pharmacist/issue-records', label: 'Issue Records',         icon: ClipboardList },
      { path: '/pharmacist/low-stock',     label: 'Low Stock Alert',       icon: Activity },
    ],
    ADMIN: [
      { path: '/admin/dashboard',    label: 'Dashboard',           icon: LayoutDashboard },
      { path: '/admin/users',        label: 'User Accounts',       icon: Users },
      { path: '/admin/doctors',      label: 'Doctor Management',   icon: Stethoscope },
      { path: '/admin/patients',     label: 'Patient Management',  icon: HeartPulse },
      { path: '/admin/staff',        label: 'Staff Management',    icon: UserPlus },
      { path: '/admin/departments',  label: 'Departments',         icon: Building },
      { path: '/admin/appointments', label: 'All Appointments',    icon: Calendar },
      { path: '/admin/billing',      label: 'Billing & Invoices',   icon: CreditCard },
      { path: '/admin/pharmacy',     label: 'Pharmacy Control',    icon: Pill },
      { path: '/admin/reports',      label: 'Reports & Analytics',  icon: BarChart3 },
      { path: '/admin/audit-logs',   label: 'System Audit Logs',   icon: ShieldCheck },
      { path: '/admin/settings',     label: 'System Settings',     icon: Settings },
    ]
  };

  const navItems = navConfig[role] || [];

  // On mobile: slide in/out via translate
  // On tablet (md+): always visible, but width varies (icon or full)
  const translateClass = isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0';

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col bg-[#1B1B1D] text-slate-300 border-r border-[#26272D] shadow-2xl transition-all duration-300 ${sidebarW} ${translateClass}`}
      aria-label="Main navigation"
    >
      {/* ── Brand Header ──────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#26272D] bg-[#141518] shrink-0 pt-safe">
        <div className="p-2 bg-[#2FE92B] rounded-xl text-black shadow-card shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-black tracking-tight text-white text-base leading-tight whitespace-nowrap">
              MediCare<span className="text-[#2FE92B]">360</span>
            </h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
              Hospital Platform
            </p>
          </div>
        )}

        {/* Close button – mobile only */}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#26272D] md:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Role Badge (hidden when collapsed) ────── */}
      {!collapsed && (
        <div className="px-4 py-2 bg-[#141518] border-b border-[#26272D] flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-slate-400">Role:</span>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#2FE92B]/15 text-[#2FE92B] border border-[#2FE92B]/30">
            {role}
          </span>
        </div>
      )}

      {/* ── Navigation ────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2FE92B] text-black font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#26272D]'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Collapse toggle (desktop/tablet only) ── */}
      <div className="hidden md:flex items-center justify-between px-3 py-3 border-t border-[#26272D] bg-[#141518] shrink-0">
        {!collapsed && (
          <span className="text-[10px] text-slate-500 font-medium truncate">
            MediCare360 &copy; 2026
          </span>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#26272D] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Mobile footer ─────────────────────────── */}
      {!collapsed && (
        <div className="md:hidden p-3 border-t border-[#26272D] bg-[#141518] text-xs text-slate-500 text-center pb-safe shrink-0">
          MediCare360 &copy; 2026
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
