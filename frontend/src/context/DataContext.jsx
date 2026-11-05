import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getItem, STORAGE_KEYS, resetSystemStorage } from '../utils/storage';
import { useAuth } from './AuthContext';
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
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [pharmacists, setPharmacists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medicalRecordError, setMedicalRecordError] = useState('');
  const refreshInFlightRef = useRef(null);
  const refreshQueuedRef = useRef(false);
  const medicalRecordRefreshRef = useRef(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const loadLocalData = useCallback(() => {
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
    } catch (e) {
      console.error('Error reading local data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncBackendData = useCallback(async () => {
    const token = getItem(STORAGE_KEYS.TOKEN, null);
    if (!token) return;
    try {
      const [docRes, patRes, depRes, staffRes, prescRes, apptRes, billRes, medRes, recordRes] = await Promise.allSettled([
        doctorService.getAllDoctors(),
        patientService.getAllPatients(),
        departmentService.getAllDepartments(),
        staffService.getAllStaff(),
        prescriptionService.getAllPrescriptions(),
        appointmentService.getAllAppointments(),
        billingService.getAllBills(),
        pharmacyService.getAllMedicines(),
        medicalRecordService.getAllRecords(),
      ]);
      if (docRes.status === 'fulfilled' && docRes.value?.data)   setDoctors(docRes.value.data);
      if (patRes.status === 'fulfilled' && patRes.value?.data)   setPatients(patRes.value.data);
      if (depRes.status === 'fulfilled' && depRes.value?.data)   setDepartments(depRes.value.data);
      if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
        const { nurses: n, receptionists: r, pharmacists: p } = staffRes.value.data;
        setNurses(Array.isArray(n) ? n : []);
        setReceptionists(Array.isArray(r) ? r : []);
        setPharmacists(Array.isArray(p) ? p : []);
      }
      if (prescRes.status === 'fulfilled' && prescRes.value?.data) setPrescriptions(prescRes.value.data);
      if (apptRes.status === 'fulfilled' && apptRes.value?.data)   setAppointments(apptRes.value.data);
      if (billRes.status === 'fulfilled' && billRes.value?.data)   setBills(billRes.value.data);
      if (medRes.status === 'fulfilled' && medRes.value?.data)     setMedicines(medRes.value.data);
      if (recordRes.status === 'fulfilled' && recordRes.value?.data) {
        setMedicalRecords(recordRes.value.data);
        setMedicalRecordError(recordRes.value.success === false ? recordRes.value.error : '');
      } else {
        setMedicalRecordError('Unable to load laboratory referrals. Please try again.');
      }
    } catch (err) {
      console.warn('Backend sync failed:', err);
    }
  }, []);

  const runBackendSync = useCallback(() => {
    if (refreshInFlightRef.current) return;

    const request = syncBackendData();
    refreshInFlightRef.current = request;
    const finishRefresh = () => {
      if (refreshInFlightRef.current === request) refreshInFlightRef.current = null;
      if (refreshQueuedRef.current) {
        refreshQueuedRef.current = false;
        runBackendSync();
      }
    };
    request.then(finishRefresh, finishRefresh);
  }, [syncBackendData]);

  const fetchAllData = useCallback(() => {
    // Refresh visible data from the local cache immediately. Network sync runs
    // in the background so forms do not keep users waiting on unrelated lists.
    loadLocalData();
    if (refreshInFlightRef.current) refreshQueuedRef.current = true;
    else runBackendSync();
    return Promise.resolve();
  }, [loadLocalData, runBackendSync]);

  const refreshMedicalRecords = useCallback(async () => {
    if (medicalRecordRefreshRef.current) return medicalRecordRefreshRef.current;
    const request = medicalRecordService.getAllRecords();
    medicalRecordRefreshRef.current = request;
    try {
      const result = await request;
      setMedicalRecords(result.data || []);
      setMedicalRecordError(result.success === false ? result.error : '');
      return result;
    } finally {
      if (medicalRecordRefreshRef.current === request) medicalRecordRefreshRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchAllData();
    else loadLocalData();

    const handleStorageChange = () => loadLocalData();
    const handleRefreshRequest = () => fetchAllData();
    window.addEventListener('medicare360_storage_updated', handleStorageChange);
    window.addEventListener('medicare360_refresh_data', handleRefreshRequest);
    return () => {
      window.removeEventListener('medicare360_storage_updated', handleStorageChange);
      window.removeEventListener('medicare360_refresh_data', handleRefreshRequest);
    };
  }, [currentUser, fetchAllData, loadLocalData]);

  // Derived Real Dashboard Stats
  const stats = {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter(d => !d.status || ['active', 'available'].includes(String(d.status).toLowerCase())).length,
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
      medicalRecordError,
      refreshMedicalRecords,
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
