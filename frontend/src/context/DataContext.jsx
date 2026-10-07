import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, STORAGE_KEYS, resetSystemStorage } from '../utils/storage';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { staffService } from '../services/staffService';
import { appointmentService } from '../services/appointmentService';
import { medicalRecordService } from '../services/medicalRecordService';
import { prescriptionService } from '../services/prescriptionService';
import { pharmacyService } from '../services/pharmacyService';
import { billingService } from '../services/billingService';
import { departmentService } from '../services/departmentService';
import { notificationService } from '../services/notificationService';
import { auditService } from '../services/auditService';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [pharmacists, setPharmacists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      setPatients(getItem(STORAGE_KEYS.PATIENTS, []));
      setDoctors(getItem(STORAGE_KEYS.DOCTORS, []));
      setNurses(getItem(STORAGE_KEYS.NURSES, []));
      setReceptionists(getItem(STORAGE_KEYS.RECEPTIONISTS, []));
      setPharmacists(getItem(STORAGE_KEYS.PHARMACISTS, []));
      setAppointments(getItem(STORAGE_KEYS.APPOINTMENTS, []));
      setMedicalRecords(getItem(STORAGE_KEYS.MEDICAL_RECORDS, []));
      setPrescriptions(getItem(STORAGE_KEYS.PRESCRIPTIONS, []));
      setMedicines(getItem(STORAGE_KEYS.MEDICINES, []));
      setBills(getItem(STORAGE_KEYS.BILLS, []));
      setDepartments(getItem(STORAGE_KEYS.DEPARTMENTS, []));
      setNotifications(getItem(STORAGE_KEYS.NOTIFICATIONS, []));
      setAuditLogs(getItem(STORAGE_KEYS.AUDIT_LOGS, []));
      setSystemSettings(getItem(STORAGE_KEYS.SYSTEM_SETTINGS, {}));

      // Background sync from backend if authenticated
      const token = getItem(STORAGE_KEYS.TOKEN, null);
      if (token) {
        doctorService.getAllDoctors().then(res => {
          if (res?.data && res.data.length > 0) setDoctors(res.data);
        }).catch(() => {});
        patientService.getAllPatients().then(res => {
          if (res?.data && res.data.length > 0) setPatients(res.data);
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error fetching system data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    const handleStorageChange = () => fetchAllData();
    window.addEventListener('medicare360_storage_updated', handleStorageChange);
    return () => window.removeEventListener('medicare360_storage_updated', handleStorageChange);
  }, [fetchAllData]);

  // Derived Real Dashboard Stats
  const stats = {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter(d => d.status === 'Active').length,
    totalNurses: nurses.length,
    totalReceptionists: receptionists.length,
    totalPharmacists: pharmacists.length,
    totalAppointments: appointments.length,
    todayAppointments: appointments.filter(a => {
      if (!a.appointmentDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return a.appointmentDate === today;
    }).length,
    pendingAppointments: appointments.filter(a => a.status === 'Scheduled' || a.status === 'Pending').length,
    completedAppointments: appointments.filter(a => a.status === 'Completed').length,
    cancelledAppointments: appointments.filter(a => a.status === 'Cancelled').length,
    totalMedicines: medicines.length,
    availableMedicines: medicines.reduce((acc, m) => acc + (m.stockQuantity || 0), 0),
    lowStockMedicines: medicines.filter(m => (m.stockQuantity || 0) <= (m.minThreshold || 10)).length,
    totalBills: bills.length,
    pendingBills: bills.filter(b => b.status === 'Pending' || b.status === 'Unpaid').length,
    totalRevenue: bills.filter(b => b.status === 'Paid').reduce((acc, b) => acc + (parseFloat(b.totalAmount) || 0), 0),
    pendingRevenue: bills.filter(b => b.status === 'Pending' || b.status === 'Unpaid').reduce((acc, b) => acc + (parseFloat(b.totalAmount) || 0), 0),
  };

  const resetData = () => {
    resetSystemStorage();
    fetchAllData();
  };

  return (
    <DataContext.Provider value={{
      patients,
      doctors,
      nurses,
      receptionists,
      pharmacists,
      appointments,
      medicalRecords,
      prescriptions,
      medicines,
      bills,
      departments,
      notifications,
      auditLogs,
      systemSettings,
      stats,
      loading,
      refreshData: fetchAllData,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
