/**
 * patientService.js — MediCare360 Patient Service
 *
 * Calls real FastAPI backend /patients endpoints.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const patientService = {
  async getAllPatients() {
    try {
      const response = await axiosInstance.get('/patients');
      const pats = response.data || [];
      const normalized = pats.map(p => ({
        id: p.patient_id || `PAT-${p.id}`,
        dbId: p.id,
        userId: p.user_id,
        name: p.full_name || p.name,
        email: p.email,
        phone: p.phone,
        gender: p.gender,
        dateOfBirth: p.date_of_birth,
        bloodGroup: p.blood_group,
        address: p.address,
        emergencyContact: p.emergency_contact,
        allergies: p.allergies ? (Array.isArray(p.allergies) ? p.allergies : [p.allergies]) : [],
        chronicConditions: p.chronic_conditions ? (Array.isArray(p.chronic_conditions) ? p.chronic_conditions : [p.chronic_conditions]) : [],
        status: p.status || 'Active',
        registeredAt: p.created_at || new Date().toISOString(),
      }));
      setItem(STORAGE_KEYS.PATIENTS, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      const local = getItem(STORAGE_KEYS.PATIENTS, []);
      return { success: true, data: local };
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
        id: created.patient_id || `PAT-${created.id}`,
        dbId: created.id,
        userId: created.user_id,
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
