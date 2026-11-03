/**
 * prescriptionService.js — MediCare360 Prescription Service
 *
 * All prescription operations are performed against the Java Spring Boot backend.
 * The `items` array on each prescription contains the medicine details.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

/**
 * Normalize a prescription from the Java API response into a consistent frontend shape.
 * The API returns `items[].medicine_name`; we map this to a `medicines` array
 * (shape: [{name, dosage, frequency, duration, instructions}]) for backward compatibility
 * with all existing UI components that read `r.medicines`.
 */
export const normalizePrescription = (p) => {
  if (!p) return null;

  // items come from the Java backend
  const items = Array.isArray(p.items) ? p.items : [];
  // medicines is the legacy localStorage shape — keep it so old UI still works
  const medicines = items.map(item => ({
    id: item.id,
    name: item.medicine_name || item.medicineName || '',
    dosage: item.dosage || '',
    frequency: item.frequency || '',
    duration: item.duration || '',
    instructions: item.instructions || '',
  }));

  return {
    id: p.id,
    rxId: p.prescription_number || p.prescriptionNumber || `RX-${p.id}`,
    prescriptionNumber: p.prescription_number || p.prescriptionNumber || `RX-${p.id}`,
    patientId: p.patient_id ?? p.patientId,
    patientName: p.patient_name || p.patientName || 'Unknown Patient',
    doctorId: p.doctor_id ?? p.doctorId,
    doctorName: p.doctor_name || p.doctorName || 'Unknown Doctor',
    appointmentId: p.appointment_id ?? p.appointmentId ?? null,
    diagnosis: p.diagnosis || '',
    notes: p.instructions || p.notes || '',
    status: p.status || 'Active',
    items,       // raw API items [{medicine_name, dosage, ...}]
    medicines,   // normalized [{name, dosage, ...}] — used by all UI renders
    issuedAt: p.created_at || p.createdAt || p.issuedAt || new Date().toISOString(),
    createdAt: p.created_at || p.createdAt || p.issuedAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || null,
  };
};

export const prescriptionService = {
  /**
   * Fetch all prescriptions from the Java backend.
   */
  async getAllPrescriptions(patientId, doctorId) {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (patientId) params.append('patient_id', patientId);
      if (doctorId) params.append('doctor_id', doctorId);

      const response = await axiosInstance.get(`/prescriptions?${params.toString()}`);
      const normalized = (response.data || []).map(normalizePrescription);

      // Cache for offline fallback
      setItem(STORAGE_KEYS.PRESCRIPTIONS, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      // Fallback to localStorage cache
      const cached = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      return { success: true, data: cached };
    }
  },

  /**
   * Fetch prescriptions for a specific patient.
   */
  async getPrescriptionsByPatient(patientId) {
    return this.getAllPrescriptions(patientId, null);
  },

  /**
   * Create a new prescription via the Java backend.
   * doctorData must include profileId (the doctors.id numeric PK) and id (users.id).
   */
  async createPrescription(prescriptionData, doctorUser) {
    // Build the items array for the Java API: [{medicine_name, dosage, frequency, duration, instructions}]
    const items = (prescriptionData.medicines || []).map(m => ({
      medicine_name: m.name || m.medicine_name || '',
      dosage: m.dosage || '',
      frequency: m.frequency || '',
      duration: m.duration || '',
      instructions: m.instructions || '',
    }));

    // The Java API requires numeric patient_id (patients.id) and doctor_id (doctors.id)
    // patientId is already the numeric dbId from the dropdown
    const patientId = Number(prescriptionData.patientId);
    const doctorId  = Number(prescriptionData.doctorDbId || doctorUser?.doctorDbId || doctorUser?.profileDbId);

    if (!patientId || isNaN(patientId)) throw new Error('Patient ID is required to create a prescription. Please select a patient.');
    if (!doctorId  || isNaN(doctorId))  throw new Error('Doctor profile ID is required. Make sure the doctor profile is registered.');

    const payload = {
      patient_id:   patientId,
      doctor_id:    doctorId,
      diagnosis:    prescriptionData.diagnosis || prescriptionData.notes || 'General prescription',
      instructions: prescriptionData.notes || '',
      items,
    };

    try {
      const response = await axiosInstance.post('/prescriptions', payload);
      const created = normalizePrescription(response.data);

      // Update local cache
      const cached = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      cached.unshift(created);
      setItem(STORAGE_KEYS.PRESCRIPTIONS, cached);

      logAuditEvent('CREATE_PRESCRIPTION', `Prescription ${created.prescriptionNumber} issued`, doctorUser?.id, doctorUser?.name);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to create prescription');
    }
  },

  /**
   * Update prescription status (e.g. Dispensed).
   */
  async updateStatus(prescriptionId, status, currentUser) {
    try {
      const response = await axiosInstance.patch(`/prescriptions/${prescriptionId}`, { status });
      const updated = normalizePrescription(response.data);

      // Sync cache
      const cached = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      const idx = cached.findIndex(p => p.id === prescriptionId || String(p.id) === String(prescriptionId));
      if (idx !== -1) { cached[idx] = updated; setItem(STORAGE_KEYS.PRESCRIPTIONS, cached); }

      logAuditEvent('DISPENSE_PRESCRIPTION', `Prescription #${prescriptionId} marked ${status}`, currentUser?.id, currentUser?.name);
      return updated;
    } catch (err) {
      // Fallback: update local cache only
      const cached = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      const idx = cached.findIndex(p => p.id === prescriptionId || String(p.id) === String(prescriptionId));
      if (idx !== -1) {
        cached[idx].status = status;
        setItem(STORAGE_KEYS.PRESCRIPTIONS, cached);
        return cached[idx];
      }
      throw new Error(err?.response?.data?.detail || 'Failed to update prescription status');
    }
  },
};
