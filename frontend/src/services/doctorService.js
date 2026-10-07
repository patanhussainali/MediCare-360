/**
 * doctorService.js — MediCare360 Doctor Management Service
 *
 * All Doctor registrations and queries are performed against the FastAPI backend.
 * Passwords are sent securely and hashed server-side with bcrypt.
 * Doctor accounts and User logins are created in the database as the single source of truth.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const doctorService = {
  /**
   * Fetch all doctors from the backend.
   */
  async getAllDoctors() {
    try {
      const response = await axiosInstance.get('/doctors');
      const docs = response.data || [];
      const normalized = docs.map(d => ({
        id: d.id,
        doctorId: d.doctor_id || `DOC-${d.id}`,
        userId: d.user_id,
        name: d.full_name || d.name,
        email: d.email,
        phone: d.phone,
        department: d.department || 'Cardiology',
        specialization: d.specialization || d.department || 'Cardiology',
        qualification: d.qualification || 'MD, MBBS',
        experienceYears: d.experience_years ?? d.experienceYears ?? 5,
        consultationFee: d.consultation_fee ?? d.consultationFee ?? 120,
        status: d.status || 'Active',
        availableDays: d.available_days ? d.available_days.split(',') : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableHours: '09:00 AM - 04:00 PM',
        createdAt: d.created_at || new Date().toISOString(),
      }));

      // Cache locally for instant UI rendering across dashboards
      setItem(STORAGE_KEYS.DOCTORS, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      // Fallback to local storage cache if network error
      const localDocs = getItem(STORAGE_KEYS.DOCTORS, []);
      return { success: true, data: localDocs };
    }
  },

  /**
   * Fetch single doctor by ID.
   */
  async getDoctorById(id) {
    try {
      const response = await axiosInstance.get(`/doctors/${id}`);
      const d = response.data;
      return {
        success: true,
        data: {
          ...d,
          name: d.full_name || d.name,
          department: d.department || 'General Medicine',
          consultationFee: d.consultation_fee ?? d.consultationFee ?? 120,
        }
      };
    } catch (err) {
      const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
      const doc = doctors.find(d => d.id === id || d.userId === id || d.doctorId === id);
      if (!doc) throw new Error('Doctor record not found');
      return { success: true, data: doc };
    }
  },

  /**
   * Register a new Doctor account.
   * Calls the backend POST /doctors endpoint which creates both the User login (with bcrypt hash)
   * and the Doctor profile in the database.
   */
  async createDoctor(doctorData, adminUser) {
    const rawPassword = doctorData.password || 'Doctor@123';
    const cleanEmail = doctorData.email.trim().toLowerCase();
    const docName = doctorData.name.startsWith('Dr.') ? doctorData.name : `Dr. ${doctorData.name}`;

    const payload = {
      full_name: docName,
      name: docName,
      email: cleanEmail,
      password: rawPassword,
      phone: doctorData.phone || '0000000000',
      department: doctorData.department || 'Cardiology',
      specialization: doctorData.specialization || doctorData.department || 'Cardiology',
      qualification: doctorData.qualification || 'MD, MBBS',
      experience_years: Number(doctorData.experienceYears) || 5,
      consultation_fee: Number(doctorData.consultationFee) || 120,
      status: 'Available',
    };

    try {
      const response = await axiosInstance.post('/doctors', payload);
      const created = response.data;

      const normalizedDoc = {
        id: created.id,
        doctorId: created.doctor_id || `DOC-${created.id}`,
        userId: created.user_id,
        name: created.full_name || docName,
        email: cleanEmail,
        phone: payload.phone,
        department: doctorData.department || 'Cardiology',
        specialization: payload.specialization,
        qualification: payload.qualification,
        experienceYears: payload.experience_years,
        consultationFee: payload.consultation_fee,
        roomNumber: doctorData.roomNumber || 'Room 101',
        availableDays: doctorData.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableHours: doctorData.availableHours || '09:00 AM - 04:00 PM',
        status: 'Active',
        createdAt: created.created_at || new Date().toISOString(),
      };

      // Keep local state in sync
      const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
      const existingIdx = doctors.findIndex(d => d.email === cleanEmail);
      if (existingIdx >= 0) {
        doctors[existingIdx] = normalizedDoc;
      } else {
        doctors.push(normalizedDoc);
      }
      setItem(STORAGE_KEYS.DOCTORS, doctors);

      logAuditEvent('CREATE_DOCTOR', `Doctor created: ${normalizedDoc.name} (${normalizedDoc.department})`, adminUser?.id, adminUser?.name);
      return normalizedDoc;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Error creating doctor');
    }
  },

  /**
   * Update doctor schedule / status.
   */
  async updateDoctorSchedule(id, scheduleData, currentUser) {
    try {
      const payload = {};
      if (scheduleData.status) payload.status = scheduleData.status;
      if (scheduleData.availableDays) payload.available_days = Array.isArray(scheduleData.availableDays) ? scheduleData.availableDays.join(',') : scheduleData.availableDays;
      await axiosInstance.put(`/doctors/${id}`, payload).catch(() => {});
    } catch (e) {
      // Ignore network errors for local cache fallback
    }

    const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
    const index = doctors.findIndex(d => d.id === id || d.userId === id);
    if (index === -1) throw new Error('Doctor not found');

    doctors[index] = {
      ...doctors[index],
      availableDays: scheduleData.availableDays || doctors[index].availableDays,
      availableHours: scheduleData.availableHours || doctors[index].availableHours,
      status: scheduleData.status || doctors[index].status,
      updatedAt: new Date().toISOString()
    };

    setItem(STORAGE_KEYS.DOCTORS, doctors);
    logAuditEvent('UPDATE_SCHEDULE', `Schedule updated for ${doctors[index].name}`, currentUser?.id, currentUser?.name);
    return doctors[index];
  },

  /**
   * Delete a doctor account (Admin only).
   */
  async deleteDoctor(id, adminUser) {
    const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
    const doc = doctors.find(d => d.id === id || String(d.id) === String(id));

    if (doc?.userId) {
      try {
        await axiosInstance.delete(`/users/${doc.userId}`);
      } catch (e) {
        console.warn('Could not delete backend user for doctor:', e.message);
      }
    }

    const updated = doctors.filter(d => d.id !== id && String(d.id) !== String(id));
    setItem(STORAGE_KEYS.DOCTORS, updated);

    logAuditEvent('DELETE_DOCTOR', `Deleted doctor: ${doc?.name || id}`, adminUser?.id, adminUser?.name);
    return { success: true };
  }
};
