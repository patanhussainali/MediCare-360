import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';
import { notificationService } from './notificationService';

export const appointmentService = {
  async getAllAppointments() {
    return mockApiCall(() => getItem(STORAGE_KEYS.APPOINTMENTS, []));
  },

  async getAppointmentsByPatient(patientId) {
    return mockApiCall(() => {
      const appointments = getItem(STORAGE_KEYS.APPOINTMENTS, []);
      return appointments.filter(a => a.patientId === patientId || a.patientUserId === patientId);
    });
  },

  async getAppointmentsByDoctor(doctorId) {
    return mockApiCall(() => {
      const appointments = getItem(STORAGE_KEYS.APPOINTMENTS, []);
      return appointments.filter(a => a.doctorId === doctorId || a.doctorUserId === doctorId);
    });
  },

  async bookAppointment(bookingData, currentUser) {
    return mockApiCall(() => {
      const appointments = getItem(STORAGE_KEYS.APPOINTMENTS, []);
      const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);

      // Validate target doctor and patient exist in real application state
      const doctor = doctors.find(d => d.id === bookingData.doctorId || d.name === bookingData.doctorName);
      if (!doctor) throw new Error('Selected doctor is not registered in the system.');

      let patientName = bookingData.patientName;
      let patientId = bookingData.patientId;
      let patientPhone = bookingData.patientPhone || '';

      if (currentUser && currentUser.role === 'PATIENT') {
        const patientProfile = patients.find(p => p.userId === currentUser.id || p.id === currentUser.profileId);
        if (patientProfile) {
          patientName = patientProfile.name;
          patientId = patientProfile.id;
          patientPhone = patientProfile.phone;
        }
      }

      const appointmentId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;

      const newAppointment = {
        id: appointmentId,
        patientId: patientId || `PAT-GUEST`,
        patientUserId: currentUser?.role === 'PATIENT' ? currentUser.id : null,
        patientName: patientName || 'Walk-in Patient',
        patientPhone: patientPhone,
        doctorId: doctor.id,
        doctorUserId: doctor.userId,
        doctorName: doctor.name,
        department: doctor.department || bookingData.department,
        appointmentDate: bookingData.appointmentDate,
        timeSlot: bookingData.timeSlot,
        appointmentType: bookingData.appointmentType || 'In-Person Consultation',
        reason: bookingData.reason,
        status: 'Scheduled', // 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
        createdAt: new Date().toISOString(),
      };

      appointments.unshift(newAppointment);
      setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

      logAuditEvent('BOOK_APPOINTMENT', `Appointment booked (${newAppointment.id}) with ${doctor.name} for ${newAppointment.patientName}`, currentUser?.id, currentUser?.name);

      // Trigger real notifications to Doctor & Patient
      notificationService.createNotification({
        userId: doctor.userId,
        title: 'New Appointment Booked',
        message: `Appointment ${newAppointment.id} scheduled with ${newAppointment.patientName} on ${newAppointment.appointmentDate} at ${newAppointment.timeSlot}.`,
        type: 'APPOINTMENT',
      });

      if (currentUser?.id) {
        notificationService.createNotification({
          userId: currentUser.id,
          title: 'Appointment Confirmed',
          message: `Your appointment ${newAppointment.id} with ${doctor.name} has been confirmed for ${newAppointment.appointmentDate} at ${newAppointment.timeSlot}.`,
          type: 'APPOINTMENT',
        });
      }

      return newAppointment;
    });
  },

  async updateAppointmentStatus(appointmentId, status, note, currentUser) {
    return mockApiCall(() => {
      const appointments = getItem(STORAGE_KEYS.APPOINTMENTS, []);
      const index = appointments.findIndex(a => a.id === appointmentId);
      if (index === -1) throw new Error('Appointment not found');

      appointments[index].status = status;
      if (note) appointments[index].statusNote = note;
      appointments[index].updatedAt = new Date().toISOString();

      setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

      logAuditEvent('UPDATE_APPOINTMENT_STATUS', `Appointment ${appointmentId} status changed to ${status}`, currentUser?.id, currentUser?.name);

      // Notify Patient if registered
      if (appointments[index].patientUserId) {
        notificationService.createNotification({
          userId: appointments[index].patientUserId,
          title: `Appointment ${status}`,
          message: `Your appointment ${appointmentId} with ${appointments[index].doctorName} status updated to: ${status}.`,
          type: 'APPOINTMENT',
        });
      }

      return appointments[index];
    });
  },

  async cancelAppointment(appointmentId, reason, currentUser) {
    return this.updateAppointmentStatus(appointmentId, 'Cancelled', reason, currentUser);
  }
};
