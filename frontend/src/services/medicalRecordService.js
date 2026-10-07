import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';
import { notificationService } from './notificationService';

export const medicalRecordService = {
  async getAllRecords() {
    return mockApiCall(() => getItem(STORAGE_KEYS.MEDICAL_RECORDS, []));
  },

  async getRecordsByPatient(patientId) {
    return mockApiCall(() => {
      const records = getItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const patient = patients.find(p => p.id === patientId || p.userId === patientId);

      return records.filter(r => r.patientId === patientId || (patient && r.patientId === patient.id));
    });
  },

  async createRecord(recordData, doctorUser) {
    return mockApiCall(() => {
      const records = getItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);

      const patient = patients.find(p => p.id === recordData.patientId || p.name === recordData.patientName);
      if (!patient) throw new Error('Patient not found in system records.');

      const recordId = `MR-${Math.floor(100000 + Math.random() * 900000)}`;

      const newRecord = {
        id: recordId,
        patientId: patient.id,
        patientUserId: patient.userId,
        patientName: patient.name,
        doctorId: doctorUser?.profileId || doctorUser?.id || 'DOC-UNASSIGNED',
        doctorName: doctorUser?.name || 'Dr. Attending Physician',
        diagnosis: recordData.diagnosis,
        symptoms: recordData.symptoms || '',
        treatmentPlan: recordData.treatmentPlan || '',
        vitals: {
          bloodPressure: recordData.vitals?.bloodPressure || '120/80 mmHg',
          heartRate: recordData.vitals?.heartRate || '72 bpm',
          temperature: recordData.vitals?.temperature || '98.6 °F',
          spo2: recordData.vitals?.spo2 || '99%',
        },
        allergies: recordData.allergies || patient.allergies || [],
        labNotes: recordData.labNotes || '',
        attachmentUrl: recordData.attachmentUrl || null,
        date: new Date().toISOString(),
      };

      records.unshift(newRecord);
      setItem(STORAGE_KEYS.MEDICAL_RECORDS, records);

      logAuditEvent('CREATE_MEDICAL_RECORD', `Medical record ${recordId} added for ${patient.name} by ${newRecord.doctorName}`, doctorUser?.id, doctorUser?.name);

      notificationService.createNotification({
        userId: patient.userId,
        title: 'New Clinical Record Added',
        message: `Dr. ${newRecord.doctorName} added a new medical diagnosis record to your profile.`,
        type: 'SYSTEM',
      });

      return newRecord;
    });
  }
};
