import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

const parseJson = (value, fallback = {}) => {
  if (!value || typeof value !== 'string') return value || fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};

let allRecordsRequest = null;

export const normalizeMedicalRecord = (record) => {
  const examinationNotes = record.examination_notes ?? record.examinationNotes ?? '';
  const initialNotes = parseJson(examinationNotes, null);
  const parsedNotes = typeof initialNotes === 'string' ? parseJson(initialNotes, null) : initialNotes;
  const vitalSigns = parseJson(record.vital_signs ?? record.vitalSigns, {});
  const diagnosis = record.diagnosis || '';
  const storedReferral = String(parsedNotes?.kind || '').toUpperCase() === 'LAB_REFERRAL' ? parsedNotes : null;
  const referralTests = diagnosis.match(/^Lab Referral:\s*(.*)$/i)?.[1]
    ?.split(',').map(test => test.trim()).filter(Boolean) || [];
  const labReferral = storedReferral || (referralTests.length ? {
    kind: 'LAB_REFERRAL',
    tests: referralTests,
    notes: '',
    status: 'Requested',
    results: '',
  } : null);
  const normalized = {
    id: record.id,
    recordNumber: record.record_number || record.recordNumber || `REC-${record.id}`,
    patientId: record.patient_id ?? record.patientId,
    patientName: record.patient_name || record.patientName || 'Unknown Patient',
    patientCode: record.patient_code || record.patientCode || '',
    doctorId: record.doctor_id ?? record.doctorId,
    doctorName: record.doctor_name || record.doctorName || '',
    diagnosis,
    symptoms: record.symptoms || '',
    examinationNotes: typeof examinationNotes === 'string' ? examinationNotes : JSON.stringify(examinationNotes),
    treatmentPlan: typeof parsedNotes === 'string' ? parsedNotes : (parsedNotes?.notes || ''),
    vitals: vitalSigns && typeof vitalSigns === 'object' ? vitalSigns : {},
    attachments: record.attachments || '',
    visitDate: record.visit_date || record.visitDate || '',
    date: record.visit_date || record.visitDate || record.created_at || record.createdAt || new Date().toISOString(),
    createdAt: record.created_at || record.createdAt || new Date().toISOString(),
    updatedAt: record.updated_at || record.updatedAt || null,
    labReferral,
  };
  return normalized;
};

export const medicalRecordService = {
  async getAllRecords() {
    if (!allRecordsRequest) {
      allRecordsRequest = (async () => {
        try {
          const response = await axiosInstance.get('/medical-records?limit=200');
          const records = (response.data || []).map(normalizeMedicalRecord);
          setItem(STORAGE_KEYS.MEDICAL_RECORDS, records);
          return { success: true, data: records };
        } catch (err) {
          return {
            success: false,
            data: getItem(STORAGE_KEYS.MEDICAL_RECORDS, []),
            error: err?.response?.data?.detail || err?.message || 'Unable to load laboratory referrals.',
          };
        }
      })().finally(() => { allRecordsRequest = null; });
    }
    return allRecordsRequest;
  },

  async getRecordsByPatient(patientId) {
    try {
      const response = await axiosInstance.get(`/medical-records/patient/${patientId}?limit=200`);
      return { success: true, data: (response.data || []).map(normalizeMedicalRecord) };
    } catch {
      const records = getItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
      return { success: true, data: records.filter(record => String(record.patientId) === String(patientId)) };
    }
  },

  async createRecord(recordData, currentUser) {
    const patientId = Number(recordData.patientId);
    if (!patientId) throw new Error('Select a valid patient record.');

    const cachedDoctors = getItem(STORAGE_KEYS.DOCTORS, []);
    const ownDoctor = cachedDoctors.find(doctor =>
      String(doctor.userId) === String(currentUser?.id) || String(doctor.id) === String(currentUser?.profileId)
    );
    const doctorId = Number(recordData.doctorId || ownDoctor?.id);
    const isReferral = recordData.recordType === 'LAB_REFERRAL';
    const referralData = isReferral ? {
      kind: 'LAB_REFERRAL',
      tests: recordData.tests || [],
      notes: recordData.labNotes || '',
      status: 'Requested',
      results: '',
    } : null;
    const payload = {
      patient_id: patientId,
      doctor_id: doctorId || null,
      diagnosis: isReferral ? `Lab Referral: ${(recordData.tests || []).join(', ')}` : (recordData.diagnosis || 'Nursing Vitals Log'),
      symptoms: recordData.symptoms || '',
      examination_notes: referralData ? JSON.stringify(referralData) : (recordData.treatmentPlan || ''),
      vital_signs: recordData.vitals ? JSON.stringify(recordData.vitals) : null,
      visit_date: new Date().toISOString().slice(0, 10),
    };

    try {
      const response = await axiosInstance.post('/medical-records', payload);
      const created = normalizeMedicalRecord(response.data);
      const records = getItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
      records.unshift(created);
      setItem(STORAGE_KEYS.MEDICAL_RECORDS, records);
      logAuditEvent(isReferral ? 'CREATE_LAB_REFERRAL' : 'CREATE_MEDICAL_RECORD', `${created.recordNumber} created for ${created.patientName}`, currentUser?.id, currentUser?.name);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to save the medical record');
    }
  },

  async updateRecord(id, updateData, currentUser) {
    const current = getItem(STORAGE_KEYS.MEDICAL_RECORDS, []).find(record => String(record.id) === String(id));
    const examinationNotes = updateData.labReferral
      ? JSON.stringify(updateData.labReferral)
      : (updateData.examinationNotes ?? current?.examinationNotes ?? '');
    try {
      const response = await axiosInstance.patch(`/medical-records/${id}`, {
        diagnosis: updateData.diagnosis,
        symptoms: updateData.symptoms,
        examination_notes: examinationNotes,
        vital_signs: updateData.vitals ? JSON.stringify(updateData.vitals) : undefined,
        attachments: updateData.attachments,
      });
      const updated = normalizeMedicalRecord(response.data);
      const records = getItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
      const index = records.findIndex(record => String(record.id) === String(id));
      if (index !== -1) records[index] = updated;
      setItem(STORAGE_KEYS.MEDICAL_RECORDS, records);
      logAuditEvent('UPDATE_MEDICAL_RECORD', `Record ${id} updated`, currentUser?.id, currentUser?.name);
      return updated;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to update the medical record');
    }
  },
};
