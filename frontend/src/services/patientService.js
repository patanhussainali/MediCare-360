/**
 * patientService.js — MediCare360 Patient Service
 *
 * Calls real FastAPI backend /patients endpoints.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

const normalizePatient = p => ({
  id: p.id,
  dbId: p.id,
  patientId: p.patient_id || p.patientId || `PAT-${p.id}`,
  userId: p.user_id ?? p.userId,
  userCode: p.user_code || p.userCode || '',
  name: p.full_name || p.fullName || p.name,
  email: p.email,
  phone: p.phone,
  gender: p.gender,
  dateOfBirth: p.date_of_birth || p.dateOfBirth,
  bloodGroup: p.blood_group || p.bloodGroup,
  address: p.address,
  emergencyContact: p.emergency_contact || p.emergencyContact,
  allergies: p.allergies ? (Array.isArray(p.allergies) ? p.allergies : [p.allergies]) : [],
  chronicConditions: p.chronic_conditions || p.chronicConditions
    ? (Array.isArray(p.chronic_conditions || p.chronicConditions)
      ? (p.chronic_conditions || p.chronicConditions)
      : [p.chronic_conditions || p.chronicConditions])
    : [],
  status: p.status || 'Active',
  registeredAt: p.created_at || p.createdAt || new Date().toISOString(),
});

export const patientService = {
  async getAllPatients(search = '') {
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search.trim()) params.set('search', search.trim());
      const response = await axiosInstance.get(`/patients?${params.toString()}`);
      const normalized = (response.data || []).map(normalizePatient);
      if (!search.trim()) setItem(STORAGE_KEYS.PATIENTS, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      const local = getItem(STORAGE_KEYS.PATIENTS, []);
      return { success: true, data: local };
    }
  },

  async searchPatients(query) {
    const value = String(query || '').trim();
    if (value.length < 2) return { success: true, data: [] };
    return this.getAllPatients(value);
  },

  async getMyProfile() {
    try {
      const response = await axiosInstance.get('/patients/me');
      return { success: true, data: normalizePatient(response.data) };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Unable to load your patient profile.');
    }
  },

  async getPatientById(id) {
    try {
      const response = await axiosInstance.get(`/patients/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const patient = patients.find(p => p.id === id || p.userId === id || p.dbId === id);
      if (!patient) throw new Error('Patient record not found');
      return { success: true, data: patient };
    }
  },

  async createPatient(patientData, adminUser) {
    const cleanEmail = patientData.email.trim().toLowerCase();
    const rawPassword = patientData.password || 'Patient@123';

    const payload = {
      full_name: patientData.name,
      email: cleanEmail,
      password: rawPassword,
      phone: patientData.phone || '0000000000',
      gender: patientData.gender || 'Other',
      date_of_birth: patientData.dateOfBirth || '2000-01-01',
      blood_group: patientData.bloodGroup || 'O+',
      address: patientData.address || '',
      emergency_contact: patientData.emergencyContact || '',
      allergies: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : (patientData.allergies || null),
      chronic_conditions: Array.isArray(patientData.chronicConditions) ? patientData.chronicConditions.join(', ') : (patientData.chronicConditions || null),
      status: 'Active',
    };

    try {
      const response = await axiosInstance.post('/patients', payload);
      const created = response.data;

      const newPatient = {
        id: created.id,                               // numeric PK
        dbId: created.id,
        patientId: created.patient_id || `PAT-${created.id}`,  // MRN display
        userId: created.user_id,
        userCode: created.user_code || created.userCode || '',
        name: created.full_name || patientData.name,
        email: cleanEmail,
        phone: payload.phone,
        gender: payload.gender,
        dateOfBirth: payload.date_of_birth,
        bloodGroup: payload.blood_group,
        address: payload.address,
        emergencyContact: payload.emergency_contact,
        allergies: patientData.allergies ? (Array.isArray(patientData.allergies) ? patientData.allergies : [patientData.allergies]) : [],
        chronicConditions: patientData.chronicConditions ? (Array.isArray(patientData.chronicConditions) ? patientData.chronicConditions : [patientData.chronicConditions]) : [],
        status: 'Active',
        registeredAt: created.created_at || new Date().toISOString(),
      };

      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      patients.push(newPatient);
      setItem(STORAGE_KEYS.PATIENTS, patients);

      logAuditEvent('CREATE_PATIENT', `Patient record created: ${newPatient.name} (${newPatient.id})`, adminUser?.id, adminUser?.name);
      return newPatient;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to create patient');
    }
  },

  async updatePatient(id, updateData, adminUser) {
    try {
      await axiosInstance.put(`/patients/${id}`, updateData).catch(() => {});
    } catch (e) {}

    const patients = getItem(STORAGE_KEYS.PATIENTS, []);
    const index = patients.findIndex(p => p.id === id || p.dbId === id);
    if (index === -1) throw new Error('Patient not found');

    patients[index] = { ...patients[index], ...updateData, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.PATIENTS, patients);

    logAuditEvent('UPDATE_PATIENT', `Updated patient record for ${patients[index].name}`, adminUser?.id, adminUser?.name);
    return patients[index];
  },

  async deletePatient(id, adminUser) {
    const patients = getItem(STORAGE_KEYS.PATIENTS, []);
    const patient = patients.find(p => p.id === id || p.dbId === id);

    if (patient?.userId) {
      try {
        await axiosInstance.delete(`/users/${patient.userId}`);
      } catch (e) {}
    }

    const updated = patients.filter(p => p.id !== id && p.dbId !== id);
    setItem(STORAGE_KEYS.PATIENTS, updated);

    logAuditEvent('DELETE_PATIENT', `Deleted patient record: ${patient?.name || id}`, adminUser?.id, adminUser?.name);
    return { success: true, message: 'Patient removed successfully' };
  }
};
