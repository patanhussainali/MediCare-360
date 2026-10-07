// Local Storage Persistence Utility for MediCare360
// Handles only non-authentication application state (UI preferences, cached data).
// Authentication is handled exclusively by the FastAPI backend + database.

const STORAGE_KEYS = {
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
  REFRESH_TOKEN: 'medicare360_refresh_token',
};

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

/**
 * Initializes non-authentication localStorage keys if not already present.
 * NOTE: No credentials, users, or passwords are stored here.
 * All authentication is handled by the backend API + database.
 */
export const initializeStorage = () => {
  const initialized = localStorage.getItem('medicare360_initialized');
  if (!initialized) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
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
  // Clears only non-auth local state; auth tokens are removed separately on logout
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.CURRENT_USER && key !== STORAGE_KEYS.TOKEN && key !== STORAGE_KEYS.REFRESH_TOKEN) {
      localStorage.removeItem(key);
    }
  });
  localStorage.removeItem('medicare360_initialized');
  initializeStorage();
};

export { STORAGE_KEYS };
