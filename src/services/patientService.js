import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const patientService = {
  async getAllPatients() {
    return mockApiCall(() => getItem(STORAGE_KEYS.PATIENTS, []));
  },

  async getPatientById(id) {
    return mockApiCall(() => {
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const patient = patients.find(p => p.id === id || p.userId === id);
      if (!patient) throw new Error('Patient record not found');
      return patient;
    });
  },

  async createPatient(patientData, adminUser) {
    return mockApiCall(() => {
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const users = getItem(STORAGE_KEYS.USERS, []);
      const cleanEmail = patientData.email.trim().toLowerCase();

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error('User account with this email already exists.');
      }

      const patId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
      const userId = `usr-pat-${Date.now()}`;

      const newPatient = {
        id: patId,
        userId: userId,
        name: patientData.name,
        email: cleanEmail,
        phone: patientData.phone,
        gender: patientData.gender,
        dateOfBirth: patientData.dateOfBirth,
        bloodGroup: patientData.bloodGroup || 'O+',
        address: patientData.address || '',
        emergencyContact: patientData.emergencyContact || '',
        allergies: patientData.allergies ? (Array.isArray(patientData.allergies) ? patientData.allergies : patientData.allergies.split(',')) : [],
        chronicConditions: patientData.chronicConditions ? (Array.isArray(patientData.chronicConditions) ? patientData.chronicConditions : patientData.chronicConditions.split(',')) : [],
        status: 'Active',
        registeredAt: new Date().toISOString(),
      };

      const newUser = {
        id: userId,
        profileId: patId,
        name: patientData.name,
        email: cleanEmail,
        password: patientData.password || 'Patient@123',
        role: 'PATIENT',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      patients.push(newPatient);
      users.push(newUser);

      setItem(STORAGE_KEYS.PATIENTS, patients);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('CREATE_PATIENT', `Patient record created: ${patientData.name} (${patId})`, adminUser?.id, adminUser?.name);

      return newPatient;
    });
  },

  async updatePatient(id, updateData, adminUser) {
    return mockApiCall(() => {
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Patient not found');

      patients[index] = { ...patients[index], ...updateData, updatedAt: new Date().toISOString() };
      setItem(STORAGE_KEYS.PATIENTS, patients);

      logAuditEvent('UPDATE_PATIENT', `Updated patient record for ${patients[index].name}`, adminUser?.id, adminUser?.name);
      return patients[index];
    });
  },

  async deletePatient(id, adminUser) {
    return mockApiCall(() => {
      let patients = getItem(STORAGE_KEYS.PATIENTS, []);
      let users = getItem(STORAGE_KEYS.USERS, []);

      const patient = patients.find(p => p.id === id);
      if (!patient) throw new Error('Patient not found');

      patients = patients.filter(p => p.id !== id);
      users = users.filter(u => u.profileId !== id && u.id !== patient.userId);

      setItem(STORAGE_KEYS.PATIENTS, patients);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('DELETE_PATIENT', `Deleted patient record: ${patient.name}`, adminUser?.id, adminUser?.name);
      return { success: true, message: 'Patient removed successfully' };
    });
  }
};
