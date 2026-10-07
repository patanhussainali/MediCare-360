/**
 * authService.js — MediCare360 Authentication Service
 *
 * All authentication is performed against the FastAPI backend.
 * No credentials, user lists, or passwords are stored in this file.
 * The backend (SQLite/PostgreSQL) is the single source of truth.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const authService = {
  /**
   * Check if system has any registered admin.
   * Calls the backend /auth/check-admin endpoint.
   */
  async checkAdminStatus() {
    try {
      const response = await axiosInstance.get('/auth/check-admin');
      return { success: true, data: response.data };
    } catch (err) {
      // If endpoint not available (e.g., first run), assume no admin yet
      const status = err?.response?.status;
      if (status === 404 || status === undefined) {
        return { success: true, data: { hasAdmin: false } };
      }
      return { success: true, data: { hasAdmin: false } };
    }
  },

  /**
   * Initial setup routine for establishing the primary Admin account.
   * Sends credentials to the backend; password is hashed server-side with bcrypt.
   */
  async setupMasterAdmin(adminData) {
    try {
      const response = await axiosInstance.post('/auth/setup-admin', {
        full_name: adminData.name || 'Hospital Administrator',
        email: adminData.email.trim().toLowerCase(),
        password: adminData.password,
        role: 'ADMIN',
      });

      const { access_token, refresh_token, user } = response.data;

      // Store safe session data (no password, no hash)
      const userSession = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department || 'Executive Administration',
        status: user.is_active ? 'Active' : 'Inactive',
      };

      setItem(STORAGE_KEYS.CURRENT_USER, userSession);
      setItem(STORAGE_KEYS.TOKEN, access_token);
      if (refresh_token) setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);

      logAuditEvent('INITIAL_SYSTEM_SETUP', 'System Administrator account created', userSession.id, userSession.name);

      return {
        success: true,
        data: { message: 'Master Administrator created successfully', user: userSession },
      };
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || 'Setup failed';
      throw new Error(detail);
    }
  },

  /**
   * Login — sends credentials to backend for bcrypt verification and JWT issuance.
   * Never validates passwords locally.
   */
  async login(email, password, selectedRole) {
    if (!email || !password) {
      throw new Error('Invalid credentials or unauthorized role.');
    }

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole ? selectedRole.toUpperCase() : null,
      });

      const { access_token, refresh_token, user } = response.data;

      if (!user) {
        throw new Error('Invalid credentials or unauthorized role.');
      }

      // Enforce role matching (backend validates, but also double-check in session)
      const normalizedSelectedRole = (selectedRole || '').toUpperCase();
      const normalizedUserRole = (user.role || '').toUpperCase();
      if (normalizedSelectedRole && normalizedUserRole !== normalizedSelectedRole) {
        throw new Error('Invalid credentials or unauthorized role.');
      }

      // Store only safe, non-sensitive session info (never password or hash)
      const userSession = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,          // Role from backend/database — never from client input
        department: user.department || 'N/A',
        profileId: user.profile_id || null,
        status: user.is_active ? 'Active' : 'Inactive',
      };

      setItem(STORAGE_KEYS.CURRENT_USER, userSession);
      setItem(STORAGE_KEYS.TOKEN, access_token);
      if (refresh_token) setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);

      logAuditEvent('USER_LOGIN', `User authenticated via ${user.role} Portal`, user.id, user.full_name);

      return { success: true, data: { user: userSession, token: access_token } };
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        throw new Error('Invalid credentials or unauthorized role.');
      }
      throw new Error(err?.response?.data?.detail || err.message || 'Login failed');
    }
  },

  /**
   * Patient self-registration — password hashed server-side.
   */
  async registerPatient(patientData) {
    try {
      const response = await axiosInstance.post('/auth/register', {
        full_name: patientData.name,
        email: patientData.email.trim().toLowerCase(),
        password: patientData.password,
        phone_number: patientData.phone,
        role: 'PATIENT',
      });

      logAuditEvent('PATIENT_REGISTER', `New patient registered: ${patientData.name}`, response.data.id, patientData.name);

      return { success: true, data: response.data };
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || 'Registration failed';
      throw new Error(detail);
    }
  },

  /**
   * Get the currently authenticated user from local session cache.
   * The session was populated from the backend response on login.
   */
  getCurrentUser() {
    return getItem(STORAGE_KEYS.CURRENT_USER, null);
  },

  /**
   * Logout — invalidates the JWT on the backend, then clears local session.
   */
  async logout() {
    const user = getItem(STORAGE_KEYS.CURRENT_USER, null);
    try {
      // Notify backend to blacklist the token
      await axiosInstance.post('/auth/logout');
    } catch {
      // Proceed with local cleanup even if backend is unreachable
    } finally {
      if (user) {
        logAuditEvent('USER_LOGOUT', 'User logged out', user.id, user.name);
      }
      removeItem(STORAGE_KEYS.CURRENT_USER);
      removeItem(STORAGE_KEYS.TOKEN);
      removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  },

  /**
   * Refresh the access token using the stored refresh token.
   */
  async refreshAccessToken() {
    const refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN, null);
    if (!refreshToken) return null;

    try {
      const response = await axiosInstance.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token: newRefreshToken } = response.data;
      setItem(STORAGE_KEYS.TOKEN, access_token);
      if (newRefreshToken) setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      return access_token;
    } catch {
      // Refresh failed — clear session
      removeItem(STORAGE_KEYS.CURRENT_USER);
      removeItem(STORAGE_KEYS.TOKEN);
      removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      return null;
    }
  },
};
