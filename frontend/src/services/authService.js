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
        userCode: user.user_code || user.userCode || user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,          // Role from backend/database — never from client input
        department: user.department || 'N/A',
        profileId: user.profile_id || null,
        phone: user.phone || '',
        status: user.is_active ? 'Active' : 'Inactive',
      };

      setItem(STORAGE_KEYS.CURRENT_USER, userSession);
      setItem(STORAGE_KEYS.TOKEN, access_token);
      if (refresh_token) setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);

      logAuditEvent('USER_LOGIN', `User authenticated via ${user.role} Portal`, user.id, user.full_name);

      return { success: true, data: { user: userSession, token: access_token } };
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        const detail = err?.response?.data?.detail || err?.response?.data?.message;
        throw new Error(detail || 'Invalid credentials or unauthorized role.');
      }

      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isNetlifyHtml404 = err?.response?.status === 404 && (
        !err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' && err.response.data.includes('<!DOCTYPE'))
      );
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || isNetlifyHtml404;

      // Never create a local demo session in production. It cannot authenticate to
      // protected backend endpoints and leaves users with a misleading 401 later.
      if (isDeployed && isBackendUnreachable) {
        removeItem(STORAGE_KEYS.CURRENT_USER);
        removeItem(STORAGE_KEYS.TOKEN);
        removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        throw new Error('Cannot reach the live backend. Please check the backend deployment and try signing in again.');
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
      const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isBackendUnreachable = !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 404 || err.message?.includes('Live backend is not connected');

      if (isDeployed && isBackendUnreachable) {
        console.warn('Backend API unreachable. Registering patient in Preview Mode.');
        const cleanEmail = patientData.email.trim().toLowerCase();
        const newPatient = {
          id: Date.now(),
          patientId: `PAT-${Date.now().toString().slice(-4)}`,
          name: patientData.name,
          full_name: patientData.name,
          email: cleanEmail,
          phone: patientData.phone || '',
          gender: patientData.gender || 'Other',
          dateOfBirth: patientData.dateOfBirth || '',
          bloodGroup: patientData.bloodGroup || '',
          role: 'PATIENT',
          status: 'Active',
          createdAt: new Date().toISOString(),
        };

        const localUsers = getItem(STORAGE_KEYS.USERS, []);
        localUsers.push(newPatient);
        setItem(STORAGE_KEYS.USERS, localUsers);

        const localPatients = getItem(STORAGE_KEYS.PATIENTS, []);
        localPatients.push(newPatient);
        setItem(STORAGE_KEYS.PATIENTS, localPatients);

        logAuditEvent('PATIENT_REGISTER', `New patient registered in Preview Mode: ${patientData.name}`, newPatient.id, patientData.name);
        return { success: true, data: newPatient };
      }

      const errData = err?.response?.data;
      const detail = (errData?.errors?.join(', ')) || errData?.detail || err.message || 'Registration failed';
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
