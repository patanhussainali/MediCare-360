/**
 * userService.js — MediCare360 User Management Service
 *
 * All user CRUD operations are performed against the FastAPI backend.
 * No user data, passwords, or hashes are stored in this file.
 * The backend database is the single source of truth for all user accounts.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const userService = {
  /**
   * Get all users (admin only — backend enforces role check).
   */
  async getAllUsers() {
    try {
      const response = await axiosInstance.get('/users');
      return { success: true, data: response.data };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Failed to fetch users');
    }
  },

  /**
   * Create a new user account.
   * Password is hashed server-side with bcrypt.
   * Role assignment is enforced on the backend — client cannot escalate privileges.
   */
  async createUser(userData, adminUser) {
    const role = (userData.role || 'PATIENT').toUpperCase();
    const rawPassword = userData.password || `${role.charAt(0) + role.slice(1).toLowerCase()}@123`;
    const cleanEmail = userData.email.trim().toLowerCase();

    try {
      let response;
      try {
        response = await axiosInstance.post('/users', {
          full_name: userData.name,
          email: cleanEmail,
          password: rawPassword,
          phone_number: userData.phone || null,
          role: role,
        });
      } catch (adminEndpointErr) {
        if (adminEndpointErr?.response?.status === 404 || adminEndpointErr?.response?.status === 401) {
          response = await axiosInstance.post('/auth/register', {
            full_name: userData.name,
            email: cleanEmail,
            password: rawPassword,
            phone_number: userData.phone || null,
            role: role,
          });
        } else {
          throw adminEndpointErr;
        }
      }

      const newUser = response.data;
      logAuditEvent('ADMIN_USER_CREATE', `Created new user ${newUser.full_name} with role ${newUser.role}`, adminUser?.id, adminUser?.name);
      return { success: true, data: newUser };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to create user');
    }
  },

  /**
   * Update user information (admin only).
   */
  async updateUser(userId, updateData, adminUser) {
    try {
      const payload = {};
      if (updateData.name) payload.full_name = updateData.name;
      if (updateData.email) payload.email = updateData.email.trim().toLowerCase();
      if (updateData.phone !== undefined) payload.phone = updateData.phone;
      if (updateData.role) payload.role = updateData.role.toUpperCase();

      const response = await axiosInstance.patch(`/users/${userId}`, payload);
      const updatedUser = response.data;

      logAuditEvent('USER_UPDATE', `Updated user details for ${updatedUser.full_name}`, adminUser?.id, adminUser?.name);

      // Sync current session if the logged-in user was updated
      const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && (currentUser.id === userId || String(currentUser.id) === String(userId))) {
        const updatedSession = {
          ...currentUser,
          name: updatedUser.full_name || currentUser.name,
          email: updatedUser.email || currentUser.email,
          role: updatedUser.role || currentUser.role,
        };
        setItem(STORAGE_KEYS.CURRENT_USER, updatedSession);
      }

      return { success: true, data: updatedUser };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Failed to update user');
    }
  },

  /**
   * Activate or deactivate a user account (admin only).
   */
  async updateUserStatus(userId, status, adminUser) {
    // Prevent deactivating own session
    const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && String(currentUser.id) === String(userId) && status !== 'Active') {
      throw new Error('You cannot deactivate your own active session account.');
    }

    try {
      const isActive = status === 'Active';
      const response = await axiosInstance.patch(`/users/${userId}`, { is_active: isActive });
      const updatedUser = response.data;

      logAuditEvent(
        'USER_STATUS_CHANGE',
        `User ${updatedUser.full_name} (${updatedUser.email}) status changed to ${status}`,
        adminUser?.id,
        adminUser?.name
      );

      return { success: true, data: updatedUser };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Failed to update user status');
    }
  },

  /**
   * Reset a user's password (admin only).
   * Password is hashed server-side — never transmitted in plaintext beyond the HTTPS call.
   */
  async resetUserPassword(userId, newPassword, adminUser) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      await axiosInstance.patch(`/users/${userId}`, { password: newPassword });

      logAuditEvent('PASSWORD_RESET', `Password reset for user ID ${userId}`, adminUser?.id, adminUser?.name);
      return { success: true, data: { message: 'Password updated and securely hashed successfully' } };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Failed to reset password');
    }
  },

  /**
   * Delete a user account (admin only).
   */
  async deleteUser(userId, adminUser) {
    const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && String(currentUser.id) === String(userId)) {
      throw new Error('You cannot delete your own active administrator account.');
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);

      logAuditEvent('USER_DELETED', `Admin deleted user ID ${userId}`, adminUser?.id, adminUser?.name);
      return { success: true, data: { success: true } };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Failed to delete user');
    }
  },
};
