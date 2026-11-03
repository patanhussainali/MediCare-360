/**
 * appointmentService.js — MediCare360 Appointment Service
 * All operations call the Java Spring Boot backend.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const normalizeAppointment = (a) => {
  if (!a) return null;
  return {
    id: a.id,
    appointmentNumber: a.appointment_number || a.appointmentNumber || `APT-${a.id}`,
    patientId: a.patient_id ?? a.patientId,
    patientName: a.patient_name || a.patientName || 'Unknown Patient',
    doctorId: a.doctor_id ?? a.doctorId,
    doctorName: a.doctor_name || a.doctorName || 'Unknown Doctor',
    departmentId: a.department_id ?? a.departmentId,
    department: a.department_name || a.department || '',
    appointmentDate: a.appointment_date || a.appointmentDate || '',
    timeSlot: a.appointment_time || a.appointmentTime || a.timeSlot || '',
    appointmentTime: a.appointment_time || a.appointmentTime || a.timeSlot || '',
    type: a.type || 'General Consultation',
    reason: a.reason || '',
    status: a.status || 'Scheduled',
    notes: a.notes || '',
    createdAt: a.created_at || a.createdAt || new Date().toISOString(),
    updatedAt: a.updated_at || a.updatedAt || null,
  };
};

export const appointmentService = {
  async getAllAppointments(patientId, doctorId) {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (patientId) params.append('patient_id', patientId);
      if (doctorId)  params.append('doctor_id', doctorId);
      const response = await axiosInstance.get(`/appointments?${params.toString()}`);
      const normalized = (response.data || []).map(normalizeAppointment);
      setItem(STORAGE_KEYS.APPOINTMENTS, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      return { success: true, data: getItem(STORAGE_KEYS.APPOINTMENTS, []) };
    }
  },

  async getAppointmentsByPatient(patientId) {
    return this.getAllAppointments(patientId, null);
  },

  async getAppointmentsByDoctor(doctorId) {
    return this.getAllAppointments(null, doctorId);
  },

  /**
   * Book an appointment.
   * patientId and doctorId must be numeric DB PKs.
   */
  async bookAppointment(bookingData, currentUser) {
    // Resolve numeric IDs — the select values are now numeric PKs
    const patientId = Number(bookingData.patientId);
    const doctorId  = Number(bookingData.doctorId);

    if (!patientId || isNaN(patientId)) throw new Error('Please select a valid patient.');
    if (!doctorId  || isNaN(doctorId))  throw new Error('Please select a valid doctor.');

    const payload = {
      patient_id:        patientId,
      doctor_id:         doctorId,
      appointment_date:  bookingData.appointmentDate,
      appointment_time:  bookingData.timeSlot || bookingData.appointmentTime || '09:00 AM',
      type:              bookingData.appointmentType || 'General Consultation',
      reason:            bookingData.reason || '',
      notes:             bookingData.notes  || '',
      status:            'Scheduled',
    };

    try {
      const response = await axiosInstance.post('/appointments', payload);
      const created = normalizeAppointment(response.data);

      const cached = getItem(STORAGE_KEYS.APPOINTMENTS, []);
      cached.unshift(created);
      setItem(STORAGE_KEYS.APPOINTMENTS, cached);

      logAuditEvent('BOOK_APPOINTMENT', `Appointment ${created.appointmentNumber} booked`, currentUser?.id, currentUser?.name);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to book appointment');
    }
  },

  async updateAppointmentStatus(appointmentId, status, note, currentUser) {
    try {
      // Use the status sub-endpoint
      const payload = { status, notes: note || '' };
      const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, payload);
      const updated = normalizeAppointment(response.data);

      const cached = getItem(STORAGE_KEYS.APPOINTMENTS, []);
      const idx = cached.findIndex(a => String(a.id) === String(appointmentId));
      if (idx !== -1) { cached[idx] = updated; setItem(STORAGE_KEYS.APPOINTMENTS, cached); }

      logAuditEvent('UPDATE_APPOINTMENT', `Appointment #${appointmentId} → ${status}`, currentUser?.id, currentUser?.name);
      return updated;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to update appointment');
    }
  },

  async cancelAppointment(appointmentId, reason, currentUser) {
    return this.updateAppointmentStatus(appointmentId, 'Cancelled', reason, currentUser);
  },
};
