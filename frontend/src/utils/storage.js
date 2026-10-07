// Local Storage Persistence Utility for MediCare360
// Guarantees zero initial hardcoded operational data.

const STORAGE_KEYS = {
  USERS: 'medicare360_users',
  PATIENTS: 'medicare360_patients',
  DOCTORS: 'medicare360_doctors',
  NURSES: 'medicare360_nurses',
  RECEPTIONISTS: 'medicare360_receptionists',
  PHARMACISTS: 'medicare360_pharmacists',
  APPOINTMENTS: 'medicare360_appointments',
  MEDICAL_RECORDS: 'medicare360_medical_records',
  PRESCRIPTIONS: 'medicare360_prescriptions',
  MEDICINES: 'medicare360_medicines',
  BILLS: 'medicare360_bills',
  PAYMENTS: 'medicare360_payments',
  NOTIFICATIONS: 'medicare360_notifications',
  DEPARTMENTS: 'medicare360_departments',
  AUDIT_LOGS: 'medicare360_audit_logs',
  SYSTEM_SETTINGS: 'medicare360_system_settings',
  CURRENT_USER: 'medicare360_current_user',
  TOKEN: 'medicare360_auth_token',
};

// Initial default departments (can be modified by Admin)
const DEFAULT_DEPARTMENTS = [
  { id: 'dep-1', name: 'Cardiology', code: 'CARD', description: 'Heart & Cardiovascular Care', status: 'Active' },
  { id: 'dep-2', name: 'Neurology', code: 'NEUR', description: 'Brain & Nervous System Care', status: 'Active' },
  { id: 'dep-3', name: 'Pediatrics', code: 'PEDI', description: 'Child Healthcare', status: 'Active' },
  { id: 'dep-4', name: 'Orthopedics', code: 'ORTH', description: 'Bones & Joint Care', status: 'Active' },
  { id: 'dep-5', name: 'Oncology', code: 'ONCO', description: 'Cancer Care & Treatment', status: 'Active' },
  { id: 'dep-6', name: 'General Medicine', code: 'GENM', description: 'Primary Healthcare', status: 'Active' },
  { id: 'dep-7', name: 'Emergency', code: 'EMER', description: '24/7 Critical Trauma & Urgent Care', status: 'Active' },
];

export const getItem = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('medicare360_storage_updated'));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new Event('medicare360_storage_updated'));
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// Default master admin — plain-text password is handled by verifyPassword's legacy fallback.
// Newly created staff (Doctor, Nurse, etc.) get async SHA-256 hashes via hashPassword().
const DEFAULT_ADMIN = {
  id: 'usr-admin-1',
  name: 'Hospital Administrator',
  email: 'hussainalipatan@gmail.com',
  password: 'patan@02',
  password_hash: 'patan@02',
  role: 'ADMIN',
  department: 'Executive Administration',
  status: 'Active',
  createdAt: new Date().toISOString(),
};

// Clean state initialization check
export const initializeStorage = () => {
  let users = getItem(STORAGE_KEYS.USERS, null);
  if (!users || users.length === 0) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]));
  } else {
    // Ensure the master admin account always exists
    const adminIndex = users.findIndex(u => u.role === 'ADMIN');
    if (adminIndex === -1) {
      // No admin found — add default admin
      users.push(DEFAULT_ADMIN);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } else {
      // Sync email if it was previously set to a legacy default
      if (users[adminIndex].email === 'admin@medicare360.com') {
        users[adminIndex].email = 'hussainalipatan@gmail.com';
        users[adminIndex].password = 'patan@02';
        users[adminIndex].password_hash = 'patan@02';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    }
  }
  
  const initialized = localStorage.getItem('medicare360_initialized');
  if (!initialized) {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]));
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NURSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECEPTIONISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PHARMACISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify({
      hospitalName: 'MediCare360 Medical Center',
      tagline: 'Excellence in Compassionate Healthcare',
      address: '742 Evergreen Health Boulevard, Medical District',
      phone: '+1 (800) 555-3600',
      email: 'contact@medicare360.org',
      emergencyContact: '+1 (800) 911-3600',
      operatingHours: '24/7 Emergency & Inpatient | Outpatient: 8:00 AM - 8:00 PM',
      currency: 'USD ($)',
      taxRate: 5,
    }));
    localStorage.setItem('medicare360_initialized', 'true');
  }
};

export const resetSystemStorage = () => {
  localStorage.clear();
  initializeStorage();
};

export { STORAGE_KEYS };
