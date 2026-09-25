import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const staffService = {
  async getAllStaff() {
    return mockApiCall(() => {
      const nurses = getItem(STORAGE_KEYS.NURSES, []);
      const receptionists = getItem(STORAGE_KEYS.RECEPTIONISTS, []);
      const pharmacists = getItem(STORAGE_KEYS.PHARMACISTS, []);
      return { nurses, receptionists, pharmacists };
    });
  },

  async createStaffMember(staffData, adminUser) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const cleanEmail = staffData.email.trim().toLowerCase();

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email address already exists.');
      }

      const role = staffData.role; // 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST'
      const prefixMap = { NURSE: 'NUR', RECEPTIONIST: 'REC', PHARMACIST: 'PHAR' };
      const storageKeyMap = { NURSE: STORAGE_KEYS.NURSES, RECEPTIONIST: STORAGE_KEYS.RECEPTIONISTS, PHARMACIST: STORAGE_KEYS.PHARMACISTS };

      const prefix = prefixMap[role] || 'STF';
      const storageKey = storageKeyMap[role];
      const staffId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const userId = `usr-${role.toLowerCase()}-${Date.now()}`;

      const newStaffRecord = {
        id: staffId,
        userId: userId,
        name: staffData.name,
        email: cleanEmail,
        phone: staffData.phone,
        role: role,
        department: staffData.department || 'General Healthcare',
        shift: staffData.shift || 'Day Shift (08:00 AM - 04:00 PM)',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      const newUser = {
        id: userId,
        profileId: staffId,
        name: staffData.name,
        email: cleanEmail,
        password: staffData.password || `${role.charAt(0) + role.slice(1).toLowerCase()}@123`,
        role: role,
        department: staffData.department,
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      const existingStaffList = getItem(storageKey, []);
      existingStaffList.push(newStaffRecord);
      users.push(newUser);

      setItem(storageKey, existingStaffList);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('CREATE_STAFF', `Created ${role} account for ${staffData.name}`, adminUser?.id, adminUser?.name);

      return newStaffRecord;
    });
  },

  async deleteStaffMember(id, role, adminUser) {
    return mockApiCall(() => {
      const storageKeyMap = { NURSE: STORAGE_KEYS.NURSES, RECEPTIONIST: STORAGE_KEYS.RECEPTIONISTS, PHARMACIST: STORAGE_KEYS.PHARMACISTS };
      const storageKey = storageKeyMap[role];
      let staffList = getItem(storageKey, []);
      let users = getItem(STORAGE_KEYS.USERS, []);

      const staff = staffList.find(s => s.id === id);
      if (!staff) throw new Error('Staff record not found');

      staffList = staffList.filter(s => s.id !== id);
      users = users.filter(u => u.profileId !== id && u.id !== staff.userId);

      setItem(storageKey, staffList);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('DELETE_STAFF', `Removed ${role} record for ${staff.name}`, adminUser?.id, adminUser?.name);
      return { success: true };
    });
  }
};
