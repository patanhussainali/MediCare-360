import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';
import { notificationService } from './notificationService';

export const prescriptionService = {
  async getAllPrescriptions() {
    return mockApiCall(() => getItem(STORAGE_KEYS.PRESCRIPTIONS, []));
  },

  async getPrescriptionsByPatient(patientId) {
    return mockApiCall(() => {
      const prescriptions = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const patient = patients.find(p => p.id === patientId || p.userId === patientId);

      return prescriptions.filter(p => p.patientId === patientId || (patient && p.patientId === patient.id));
    });
  },

  async createPrescription(prescriptionData, doctorUser) {
    return mockApiCall(() => {
      const prescriptions = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);

      const patient = patients.find(p => p.id === prescriptionData.patientId || p.name === prescriptionData.patientName);
      if (!patient) throw new Error('Patient not found in system records.');

      const rxId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

      const newPrescription = {
        id: rxId,
        patientId: patient.id,
        patientUserId: patient.userId,
        patientName: patient.name,
        doctorId: doctorUser?.profileId || doctorUser?.id || 'DOC-UNASSIGNED',
        doctorName: doctorUser?.name || 'Dr. Attending Physician',
        medicines: prescriptionData.medicines || [], // [{ name, dosage, frequency, duration, instructions }]
        notes: prescriptionData.notes || '',
        status: 'Pending', // 'Pending', 'Dispensed', 'Cancelled'
        issuedAt: new Date().toISOString(),
      };

      prescriptions.unshift(newPrescription);
      setItem(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);

      logAuditEvent('CREATE_PRESCRIPTION', `Prescription ${rxId} issued for ${patient.name}`, doctorUser?.id, doctorUser?.name);

      notificationService.createNotification({
        userId: patient.userId,
        title: 'New Prescription Issued',
        message: `Dr. ${newPrescription.doctorName} prescribed new medications for you (${rxId}).`,
        type: 'PRESCRIPTION',
      });

      return newPrescription;
    });
  },

  async updateStatus(rxId, status, pharmacistUser) {
    return mockApiCall(() => {
      const prescriptions = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
      const index = prescriptions.findIndex(p => p.id === rxId);
      if (index === -1) throw new Error('Prescription not found');

      prescriptions[index].status = status;
      prescriptions[index].dispensedBy = pharmacistUser?.name || 'Pharmacist';
      prescriptions[index].dispensedAt = status === 'Dispensed' ? new Date().toISOString() : null;

      setItem(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);

      logAuditEvent('DISPENSE_PRESCRIPTION', `Prescription ${rxId} marked as ${status}`, pharmacistUser?.id, pharmacistUser?.name);
      return prescriptions[index];
    });
  }
};
