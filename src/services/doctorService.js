import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const doctorService = {
  async getAllDoctors() {
    return mockApiCall(() => getItem(STORAGE_KEYS.DOCTORS, []));
  },

  async getDoctorById(id) {
    return mockApiCall(() => {
      const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
      const doc = doctors.find(d => d.id === id || d.userId === id);
      if (!doc) throw new Error('Doctor record not found');
      return doc;
    });
  },

  async createDoctor(doctorData, adminUser) {
    return mockApiCall(() => {
      const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
      const users = getItem(STORAGE_KEYS.USERS, []);
      const cleanEmail = doctorData.email.trim().toLowerCase();

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email address already exists.');
      }

      const docId = `DOC-${Math.floor(100 + Math.random() * 900)}`;
      const userId = `usr-doc-${Date.now()}`;

      const newDoctor = {
        id: docId,
        userId: userId,
        name: doctorData.name.startsWith('Dr.') ? doctorData.name : `Dr. ${doctorData.name}`,
        email: cleanEmail,
        phone: doctorData.phone,
        department: doctorData.department,
        specialization: doctorData.specialization || doctorData.department,
        qualification: doctorData.qualification || 'MD, MBBS',
        experienceYears: doctorData.experienceYears || 5,
        consultationFee: doctorData.consultationFee || 100,
        roomNumber: doctorData.roomNumber || 'Room 101',
        availableDays: doctorData.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableHours: doctorData.availableHours || '09:00 AM - 04:00 PM',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      const newUser = {
        id: userId,
        profileId: docId,
        name: newDoctor.name,
        email: cleanEmail,
        password: doctorData.password || 'Doctor@123',
        role: 'DOCTOR',
        department: doctorData.department,
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      doctors.push(newDoctor);
      users.push(newUser);

      setItem(STORAGE_KEYS.DOCTORS, doctors);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('CREATE_DOCTOR', `Doctor created: ${newDoctor.name} (${doctorData.department})`, adminUser?.id, adminUser?.name);

      return newDoctor;
    });
  },

  async updateDoctorSchedule(id, scheduleData, currentUser) {
    return mockApiCall(() => {
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
    });
  },

  async deleteDoctor(id, adminUser) {
    return mockApiCall(() => {
      let doctors = getItem(STORAGE_KEYS.DOCTORS, []);
      let users = getItem(STORAGE_KEYS.USERS, []);

      const doc = doctors.find(d => d.id === id);
      if (!doc) throw new Error('Doctor not found');

      doctors = doctors.filter(d => d.id !== id);
      users = users.filter(u => u.profileId !== id && u.id !== doc.userId);

      setItem(STORAGE_KEYS.DOCTORS, doctors);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('DELETE_DOCTOR', `Deleted doctor: ${doc.name}`, adminUser?.id, adminUser?.name);
      return { success: true };
    });
  }
};
