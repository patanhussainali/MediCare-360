import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Landing from '../pages/public/Landing';
import About from '../pages/public/About';
import Services from '../pages/public/Services';
import Departments from '../pages/public/Departments';
import Contact from '../pages/public/Contact';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import InitialAdminSetup from '../pages/public/InitialAdminSetup';
import ForgotPassword from '../pages/public/ForgotPassword';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientProfile from '../pages/patient/Profile';
import BookAppointment from '../pages/patient/BookAppointment';
import MyAppointments from '../pages/patient/MyAppointments';
import MedicalRecords from '../pages/patient/MedicalRecords';
import PatientPrescriptions from '../pages/patient/Prescriptions';
import PatientBills from '../pages/patient/Bills';
import PatientNotifications from '../pages/patient/Notifications';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorProfile from '../pages/doctor/Profile';
import TodayAppointments from '../pages/doctor/TodayAppointments';
import PatientList from '../pages/doctor/PatientList';
import DoctorPatientRecords from '../pages/doctor/PatientRecords';
import Diagnosis from '../pages/doctor/Diagnosis';
import DoctorPrescriptions from '../pages/doctor/Prescriptions';
import Schedule from '../pages/doctor/Schedule';
import DoctorNotifications from '../pages/doctor/Notifications';

// Nurse Pages
import NurseDashboard from '../pages/nurse/NurseDashboard';
import AssignedPatients from '../pages/nurse/AssignedPatients';
import PatientMonitoring from '../pages/nurse/PatientMonitoring';
import NursingTasks from '../pages/nurse/NursingTasks';
import NurseNotifications from '../pages/nurse/Notifications';

// Receptionist Pages
import ReceptionDashboard from '../pages/receptionist/ReceptionDashboard';
import PatientRegistration from '../pages/receptionist/PatientRegistration';
import ReceptionAppointmentManagement from '../pages/receptionist/AppointmentManagement';
import DoctorAvailability from '../pages/receptionist/DoctorAvailability';
import ReceptionistBilling from '../pages/receptionist/Billing';
import PatientSearch from '../pages/receptionist/PatientSearch';

// Pharmacist Pages
import PharmacyDashboard from '../pages/pharmacist/PharmacyDashboard';
import MedicineInventory from '../pages/pharmacist/MedicineInventory';
import PharmacistPrescriptions from '../pages/pharmacist/Prescriptions';
import MedicineIssueRecords from '../pages/pharmacist/MedicineIssueRecords';
import LowStockMedicines from '../pages/pharmacist/LowStockMedicines';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import DoctorManagement from '../pages/admin/DoctorManagement';
import PatientManagement from '../pages/admin/PatientManagement';
import StaffManagement from '../pages/admin/StaffManagement';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import AdminAppointmentManagement from '../pages/admin/AppointmentManagement';
import AdminBillingManagement from '../pages/admin/BillingManagement';
import AdminPharmacyManagement from '../pages/admin/PharmacyManagement';
import Reports from '../pages/admin/Reports';
import AuditLogs from '../pages/admin/AuditLogs';
import SystemSettings from '../pages/admin/SystemSettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/:portalRole" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/initial-admin-setup" element={<InitialAdminSetup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Patient Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']}><MainLayout /></ProtectedRoute>}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/book-appointment" element={<BookAppointment />} />
        <Route path="/patient/appointments" element={<MyAppointments />} />
        <Route path="/patient/medical-records" element={<MedicalRecords />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/patient/bills" element={<PatientBills />} />
        <Route path="/patient/notifications" element={<PatientNotifications />} />
      </Route>

      {/* Doctor Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']}><MainLayout /></ProtectedRoute>}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/today-appointments" element={<TodayAppointments />} />
        <Route path="/doctor/patient-list" element={<PatientList />} />
        <Route path="/doctor/patient-records" element={<DoctorPatientRecords />} />
        <Route path="/doctor/diagnosis" element={<Diagnosis />} />
        <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
        <Route path="/doctor/schedule" element={<Schedule />} />
        <Route path="/doctor/notifications" element={<DoctorNotifications />} />
      </Route>

      {/* Nurse Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['NURSE']}><MainLayout /></ProtectedRoute>}>
        <Route path="/nurse/dashboard" element={<NurseDashboard />} />
        <Route path="/nurse/assigned-patients" element={<AssignedPatients />} />
        <Route path="/nurse/patient-monitoring" element={<PatientMonitoring />} />
        <Route path="/nurse/nursing-tasks" element={<NursingTasks />} />
        <Route path="/nurse/notifications" element={<NurseNotifications />} />
      </Route>

      {/* Receptionist Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><MainLayout /></ProtectedRoute>}>
        <Route path="/receptionist/dashboard" element={<ReceptionDashboard />} />
        <Route path="/receptionist/patient-registration" element={<PatientRegistration />} />
        <Route path="/receptionist/appointment-management" element={<ReceptionAppointmentManagement />} />
        <Route path="/receptionist/doctor-availability" element={<DoctorAvailability />} />
        <Route path="/receptionist/billing" element={<ReceptionistBilling />} />
        <Route path="/receptionist/patient-search" element={<PatientSearch />} />
      </Route>

      {/* Pharmacist Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PHARMACIST']}><MainLayout /></ProtectedRoute>}>
        <Route path="/pharmacist/dashboard" element={<PharmacyDashboard />} />
        <Route path="/pharmacist/inventory" element={<MedicineInventory />} />
        <Route path="/pharmacist/prescriptions" element={<PharmacistPrescriptions />} />
        <Route path="/pharmacist/issue-records" element={<MedicineIssueRecords />} />
        <Route path="/pharmacist/low-stock" element={<LowStockMedicines />} />
      </Route>

      {/* Administrator Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/doctors" element={<DoctorManagement />} />
        <Route path="/admin/patients" element={<PatientManagement />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/departments" element={<DepartmentManagement />} />
        <Route path="/admin/appointments" element={<AdminAppointmentManagement />} />
        <Route path="/admin/billing" element={<AdminBillingManagement />} />
        <Route path="/admin/pharmacy" element={<AdminPharmacyManagement />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/settings" element={<SystemSettings />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
