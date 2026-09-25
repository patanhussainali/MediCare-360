import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const userService = {
  async getAllUsers() {
    return mockApiCall(() => getItem(STORAGE_KEYS.USERS, []));
  },

  async updateUserStatus(userId, status, adminUser) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');

      users[index].status = status;
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('USER_STATUS_CHANGE', `User ${users[index].name} (${users[index].email}) status changed to ${status}`, adminUser?.id, adminUser?.name);
      return users[index];
    });
  },

  async resetUserPassword(userId, newPassword, adminUser) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');

      users[index].password = newPassword;
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('PASSWORD_RESET', `Password reset for user ${users[index].email}`, adminUser?.id, adminUser?.name);
      return { success: true, message: 'Password updated successfully' };
    });
  }
};
