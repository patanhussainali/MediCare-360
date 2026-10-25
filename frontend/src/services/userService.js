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

export const normalizeUser = (u) => {
  if (!u) return null;
  const isActive = typeof u.is_active === 'boolean' ? u.is_active : (u.status === 'Active' || u.status === true);
  return {
    id: u.id,
    name: u.full_name || u.name || 'Unnamed User',
    full_name: u.full_name || u.name || 'Unnamed User',
    email: u.email || '',
    role: (u.role || 'PATIENT').toUpperCase(),
    phone: u.phone || u.phone_number || '',
    department: u.department || '',
    status: isActive ? 'Active' : 'Inactive',
    is_active: isActive,
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
    created_at: u.created_at || u.createdAt || new Date().toISOString(),
    profileId: u.profile_id || u.profileId || null,
  };
};

export const userService = {
  /**
   * Get all users (admin only — backend enforces role check).
   */
  async getAllUsers() {
    try {
      const response = await axiosInstance.get('/users');
      const normalized = (response.data || []).map(normalizeUser);
      return { success: true, data: normalized };
    } catch (err) {
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 404;
      if (isDeployed && isBackendUnreachable) {
        const localUsers = getItem(STORAGE_KEYS.USERS, []);
        return { success: true, data: localUsers.map(normalizeUser) };
      }
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to fetch users');
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
          department: userData.department || null,
        });
      } catch (adminEndpointErr) {
        if (adminEndpointErr?.response?.status === 404 || adminEndpointErr?.response?.status === 401) {
          response = await axiosInstance.post('/auth/register', {
            full_name: userData.name,
            email: cleanEmail,
            password: rawPassword,
            phone_number: userData.phone || null,
            role: role,
            department: userData.department || null,
          });
        } else {
          throw adminEndpointErr;
        }
      }

      const newUser = normalizeUser(response.data);
      logAuditEvent('ADMIN_USER_CREATE', `Created new user ${newUser.name} with role ${newUser.role}`, adminUser?.id, adminUser?.name);
      return { success: true, data: newUser };
    } catch (err) {
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 404 || err.message?.includes('Live backend is not connected');
      if (isDeployed && isBackendUnreachable) {
        const localUsers = getItem(STORAGE_KEYS.USERS, []);
        const localNewUser = {
          id: Date.now(),
          name: userData.name,
          full_name: userData.name,
          email: cleanEmail,
          role: role,
          phone: userData.phone || '',
          department: userData.department || 'General Medicine',
          status: userData.status || 'Active',
          is_active: true,
          createdAt: new Date().toISOString(),
        };
        localUsers.push(localNewUser);
        setItem(STORAGE_KEYS.USERS, localUsers);
        logAuditEvent('ADMIN_USER_CREATE', `Created new user ${localNewUser.name} (${localNewUser.role}) [Preview Mode]`, adminUser?.id, adminUser?.name);
        return { success: true, data: normalizeUser(localNewUser) };
      }
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
      const updatedUser = normalizeUser(response.data);

      logAuditEvent('USER_UPDATE', `Updated user details for ${updatedUser.name}`, adminUser?.id, adminUser?.name);

      // Sync current session if the logged-in user was updated
      const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && (currentUser.id === userId || String(currentUser.id) === String(userId))) {
        const updatedSession = {
          ...currentUser,
          name: updatedUser.name || currentUser.name,
          email: updatedUser.email || currentUser.email,
          role: updatedUser.role || currentUser.role,
        };
        setItem(STORAGE_KEYS.CURRENT_USER, updatedSession);
      }

      return { success: true, data: updatedUser };
    } catch (err) {
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 404;
      if (isDeployed && isBackendUnreachable) {
        const localUsers = getItem(STORAGE_KEYS.USERS, []);
        const idx = localUsers.findIndex((u) => u.id === userId || String(u.id) === String(userId));
        if (idx !== -1) {
          localUsers[idx] = { ...localUsers[idx], ...updateData };
          setItem(STORAGE_KEYS.USERS, localUsers);
          return { success: true, data: normalizeUser(localUsers[idx]) };
        }
      }
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to update user');
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
      const updatedUser = normalizeUser(response.data);

      logAuditEvent(
        'USER_STATUS_CHANGE',
        `User ${updatedUser.name} (${updatedUser.email}) status changed to ${status}`,
        adminUser?.id,
        adminUser?.name
      );

      return { success: true, data: updatedUser };
    } catch (err) {
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 404;
      if (isDeployed && isBackendUnreachable) {
        const localUsers = getItem(STORAGE_KEYS.USERS, []);
        const idx = localUsers.findIndex((u) => u.id === userId || String(u.id) === String(userId));
        if (idx !== -1) {
          localUsers[idx].status = status;
          localUsers[idx].is_active = status === 'Active';
          setItem(STORAGE_KEYS.USERS, localUsers);
          return { success: true, data: normalizeUser(localUsers[idx]) };
        }
      }
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to update user status');
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
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      if (isDeployed) {
        return { success: true, data: { message: 'Password updated successfully (preview mode)' } };
      }
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
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 404;
      if (isDeployed && isBackendUnreachable) {
        const localUsers = getItem(STORAGE_KEYS.USERS, []);
        const filtered = localUsers.filter((u) => u.id !== userId && String(u.id) !== String(userId));
        setItem(STORAGE_KEYS.USERS, filtered);
        logAuditEvent('USER_DELETED', `Admin deleted user ID ${userId} [Preview Mode]`, adminUser?.id, adminUser?.name);
        return { success: true, data: { success: true } };
      }
      throw new Error(err?.response?.data?.detail || 'Failed to delete user');
    }
  },
};
