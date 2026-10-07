/**
 * staffService.js — MediCare360 Staff Management Service
 *
 * All staff registrations and queries are performed against the FastAPI backend.
 * Passwords are hashed server-side with bcrypt.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const staffService = {
  async getAllStaff() {
    try {
      const [nursesRes, recRes, pharmRes] = await Promise.allSettled([
        axiosInstance.get('/staff/nurses'),
        axiosInstance.get('/staff/receptionists'),
        axiosInstance.get('/staff/pharmacists'),
      ]);

      const nurses = nursesRes.status === 'fulfilled' ? nursesRes.value.data : getItem(STORAGE_KEYS.NURSES, []);
      const receptionists = recRes.status === 'fulfilled' ? recRes.value.data : getItem(STORAGE_KEYS.RECEPTIONISTS, []);
      const pharmacists = pharmRes.status === 'fulfilled' ? pharmRes.value.data : getItem(STORAGE_KEYS.PHARMACISTS, []);

      setItem(STORAGE_KEYS.NURSES, nurses);
      setItem(STORAGE_KEYS.RECEPTIONISTS, receptionists);
      setItem(STORAGE_KEYS.PHARMACISTS, pharmacists);

      return { success: true, data: { nurses, receptionists, pharmacists } };
    } catch (err) {
      const nurses = getItem(STORAGE_KEYS.NURSES, []);
      const receptionists = getItem(STORAGE_KEYS.RECEPTIONISTS, []);
      const pharmacists = getItem(STORAGE_KEYS.PHARMACISTS, []);
      return { success: true, data: { nurses, receptionists, pharmacists } };
    }
  },

  async createStaffMember(staffData, adminUser) {
    const role = (staffData.role || 'NURSE').toUpperCase();
    const rawPassword = staffData.password || `${role.charAt(0) + role.slice(1).toLowerCase()}@123`;
    const cleanEmail = staffData.email.trim().toLowerCase();

    let backendResult = null;
    try {
      if (role === 'NURSE') {
        const res = await axiosInstance.post('/staff/nurses', {
          full_name: staffData.name,
          email: cleanEmail,
          password: rawPassword,
          phone: staffData.phone || '0000000000',
          shift: staffData.shift || 'Morning',
          license_number: staffData.licenseNumber || `RN-${Math.floor(10000 + Math.random() * 90000)}`,
        });
        backendResult = res.data;
      } else if (role === 'RECEPTIONIST') {
        const res = await axiosInstance.post('/staff/receptionists', {
          full_name: staffData.name,
          email: cleanEmail,
          password: rawPassword,
          phone: staffData.phone || '0000000000',
          shift: staffData.shift || 'Day',
        });
        backendResult = res.data;
      } else if (role === 'PHARMACIST') {
        const res = await axiosInstance.post('/staff/pharmacists', {
          full_name: staffData.name,
          email: cleanEmail,
          password: rawPassword,
          phone: staffData.phone || '0000000000',
          license_number: staffData.licenseNumber || `RPH-${Math.floor(10000 + Math.random() * 90000)}`,
        });
        backendResult = res.data;
      } else {
        const res = await axiosInstance.post('/users', {
          full_name: staffData.name,
          email: cleanEmail,
          password: rawPassword,
          phone_number: staffData.phone || '0000000000',
          role: role,
        });
        backendResult = res.data;
      }
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to create staff member');
    }

    // Keep local storage synced for instant dashboard display
    const prefixMap = { NURSE: 'NUR', RECEPTIONIST: 'REC', PHARMACIST: 'PHAR', LAB_TECHNICIAN: 'LAB' };
    const storageKeyMap = {
      NURSE: STORAGE_KEYS.NURSES,
      RECEPTIONIST: STORAGE_KEYS.RECEPTIONISTS,
      PHARMACIST: STORAGE_KEYS.PHARMACISTS
    };

    const prefix = prefixMap[role] || 'STF';
    const staffId = backendResult?.nurse_id || backendResult?.license_number || `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStaffRecord = {
      id: backendResult?.id || staffId,
      staffId: staffId,
      userId: backendResult?.user_id,
      name: staffData.name,
      email: cleanEmail,
      phone: staffData.phone,
      role: role,
      department: staffData.department || 'General Healthcare',
      shift: staffData.shift || 'Day Shift (08:00 AM - 04:00 PM)',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    const storageKey = storageKeyMap[role];
    if (storageKey) {
      const existingList = getItem(storageKey, []);
      existingList.push(newStaffRecord);
      setItem(storageKey, existingList);
    }

    logAuditEvent('CREATE_STAFF', `Created ${role} account for ${staffData.name}`, adminUser?.id, adminUser?.name);
    return newStaffRecord;
  },

  async deleteStaffMember(id, role, adminUser) {
    const storageKeyMap = { NURSE: STORAGE_KEYS.NURSES, RECEPTIONIST: STORAGE_KEYS.RECEPTIONISTS, PHARMACIST: STORAGE_KEYS.PHARMACISTS };
    const storageKey = storageKeyMap[role];
    let staffList = storageKey ? getItem(storageKey, []) : [];

    const staff = staffList.find(s => s.id === id);
    if (staff?.userId) {
      try {
        await axiosInstance.delete(`/users/${staff.userId}`);
      } catch (e) {
        console.warn('Could not delete backend user for staff:', e.message);
      }
    }

    if (storageKey) {
      staffList = staffList.filter(s => s.id !== id);
      setItem(storageKey, staffList);
    }

    logAuditEvent('DELETE_STAFF', `Removed ${role} record for ${staff?.name || id}`, adminUser?.id, adminUser?.name);
    return { success: true };
  }
};
