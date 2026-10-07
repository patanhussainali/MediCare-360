import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { mockApiCall } from './apiClient.js';
import { logAuditEvent } from './auditService.js';
import { hashPassword } from '../utils/security.js';

export const userService = {
  async getAllUsers() {
    return mockApiCall(() => getItem(STORAGE_KEYS.USERS, []));
  },

  async createUser(userData, adminUser) {
    const cleanEmail = userData.email.trim().toLowerCase();
    const rawPassword = userData.password || `${userData.role.charAt(0) + userData.role.slice(1).toLowerCase()}@123`;
    const passwordHash = await hashPassword(rawPassword);

    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);

      if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email address already exists.');
      }

      const role = userData.role.toUpperCase();
      const prefixMap = {
        ADMIN: 'ADM',
        DOCTOR: 'DOC',
        NURSE: 'NUR',
        RECEPTIONIST: 'REC',
        PHARMACIST: 'PHAR',
        LAB_TECHNICIAN: 'LAB',
        PATIENT: 'PAT'
      };

      const prefix = prefixMap[role] || 'USR';
      const profileId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
      const userId = `usr-${role.toLowerCase()}-${Date.now()}`;
      const now = new Date().toISOString();

      const newUser = {
        id: userId,
        profileId: profileId,
        name: userData.name,
        email: cleanEmail,
        password: passwordHash,
        password_hash: passwordHash,
        role: role,
        department: userData.department || 'General',
        phone: userData.phone || '',
        status: userData.status || 'Active',
        createdAt: now,
        updatedAt: now,
      };

      // Also create role-specific profile so they appear in corresponding operational lists
      if (role === 'DOCTOR') {
        const doctors = getItem(STORAGE_KEYS.DOCTORS, []);
        doctors.push({
          id: profileId,
          userId: userId,
          name: userData.name.startsWith('Dr.') ? userData.name : `Dr. ${userData.name}`,
          email: cleanEmail,
          phone: userData.phone || '',
          department: userData.department || 'General Medicine',
          specialization: userData.specialization || userData.department || 'General Medicine',
          consultationFee: 100,
          roomNumber: 'Room 101',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableHours: '09:00 AM - 04:00 PM',
          status: 'Active',
          createdAt: now,
        });
        setItem(STORAGE_KEYS.DOCTORS, doctors);
      } else if (role === 'NURSE') {
        const nurses = getItem(STORAGE_KEYS.NURSES, []);
        nurses.push({
          id: profileId,
          userId: userId,
          name: userData.name,
          email: cleanEmail,
          phone: userData.phone || '',
          role: 'NURSE',
          department: userData.department || 'General Healthcare',
          shift: 'Day Shift (08:00 AM - 04:00 PM)',
          status: 'Active',
          createdAt: now,
        });
        setItem(STORAGE_KEYS.NURSES, nurses);
      } else if (role === 'RECEPTIONIST') {
        const receptionists = getItem(STORAGE_KEYS.RECEPTIONISTS, []);
        receptionists.push({
          id: profileId,
          userId: userId,
          name: userData.name,
          email: cleanEmail,
          phone: userData.phone || '',
          role: 'RECEPTIONIST',
          department: userData.department || 'Front Desk',
          shift: 'Morning Shift',
          status: 'Active',
          createdAt: now,
        });
        setItem(STORAGE_KEYS.RECEPTIONISTS, receptionists);
      } else if (role === 'PHARMACIST') {
        const pharmacists = getItem(STORAGE_KEYS.PHARMACISTS, []);
        pharmacists.push({
          id: profileId,
          userId: userId,
          name: userData.name,
          email: cleanEmail,
          phone: userData.phone || '',
          role: 'PHARMACIST',
          department: 'Pharmacy',
          shift: 'Full Day Shift',
          status: 'Active',
          createdAt: now,
        });
        setItem(STORAGE_KEYS.PHARMACISTS, pharmacists);
      }

      users.push(newUser);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('ADMIN_USER_CREATE', `Created new user ${newUser.name} with role ${newUser.role}`, adminUser?.id, adminUser?.name);
      return newUser;
    });
  },

  async updateUser(userId, updateData, adminUser) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');

      // Check email uniqueness if changed
      if (updateData.email) {
        const cleanEmail = updateData.email.trim().toLowerCase();
        const conflict = users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== userId);
        if (conflict) {
          throw new Error('Email address already in use by another user.');
        }
        users[index].email = cleanEmail;
      }

      if (updateData.name) users[index].name = updateData.name;
      if (updateData.phone !== undefined) users[index].phone = updateData.phone;
      if (updateData.department !== undefined) users[index].department = updateData.department;

      // Handle role update
      const previousRole = users[index].role;
      if (updateData.role && updateData.role.toUpperCase() !== previousRole) {
        const newRole = updateData.role.toUpperCase();
        users[index].role = newRole;

        logAuditEvent(
          'USER_ROLE_CHANGED',
          `Admin changed role of ${users[index].name} from ${previousRole} to ${newRole}`,
          adminUser?.id,
          adminUser?.name
        );

        // If currently logged-in user is this updated user, sync current session immediately
        const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
        if (currentUser && currentUser.id === userId) {
          currentUser.role = newRole;
          setItem(STORAGE_KEYS.CURRENT_USER, currentUser);
        }
      }

      users[index].updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('USER_UPDATE', `Updated user details for ${users[index].name}`, adminUser?.id, adminUser?.name);
      return users[index];
    });
  },

  async updateUserStatus(userId, status, adminUser) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');

      // Prevent deactivating own session
      if (adminUser && adminUser.id === userId && status !== 'Active') {
        throw new Error('You cannot deactivate your own active session account.');
      }

      users[index].status = status;
      users[index].updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.USERS, users);

      // If active session is deactivated, update currentUser session
      const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
        currentUser.status = status;
        setItem(STORAGE_KEYS.CURRENT_USER, currentUser);
      }

      logAuditEvent('USER_STATUS_CHANGE', `User ${users[index].name} (${users[index].email}) status changed to ${status}`, adminUser?.id, adminUser?.name);
      return users[index];
    });
  },

  async resetUserPassword(userId, newPassword, adminUser) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    const passwordHash = await hashPassword(newPassword);

    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');

      users[index].password = passwordHash;
      users[index].password_hash = passwordHash;
      users[index].updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('PASSWORD_RESET', `Password reset for user ${users[index].email}`, adminUser?.id, adminUser?.name);
      return { success: true, message: 'Password updated and securely hashed successfully' };
    });
  },

  async deleteUser(userId, adminUser) {
    return mockApiCall(() => {
      if (adminUser && adminUser.id === userId) {
        throw new Error('You cannot delete your own active administrator account.');
      }

      let users = getItem(STORAGE_KEYS.USERS, []);
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) throw new Error('User not found');

      users = users.filter(u => u.id !== userId);
      setItem(STORAGE_KEYS.USERS, users);

      // Also clean up role profiles
      if (userToDelete.role === 'DOCTOR') {
        let doctors = getItem(STORAGE_KEYS.DOCTORS, []);
        doctors = doctors.filter(d => d.userId !== userId && d.id !== userToDelete.profileId);
        setItem(STORAGE_KEYS.DOCTORS, doctors);
      } else if (userToDelete.role === 'NURSE') {
        let nurses = getItem(STORAGE_KEYS.NURSES, []);
        nurses = nurses.filter(n => n.userId !== userId && n.id !== userToDelete.profileId);
        setItem(STORAGE_KEYS.NURSES, nurses);
      } else if (userToDelete.role === 'RECEPTIONIST') {
        let rec = getItem(STORAGE_KEYS.RECEPTIONISTS, []);
        rec = rec.filter(r => r.userId !== userId && r.id !== userToDelete.profileId);
        setItem(STORAGE_KEYS.RECEPTIONISTS, rec);
      } else if (userToDelete.role === 'PHARMACIST') {
        let pharm = getItem(STORAGE_KEYS.PHARMACISTS, []);
        pharm = pharm.filter(p => p.userId !== userId && p.id !== userToDelete.profileId);
        setItem(STORAGE_KEYS.PHARMACISTS, pharm);
      }

      logAuditEvent('USER_DELETED', `Admin deleted user ${userToDelete.name} (${userToDelete.email})`, adminUser?.id, adminUser?.name);
      return { success: true };
    });
  }
};
