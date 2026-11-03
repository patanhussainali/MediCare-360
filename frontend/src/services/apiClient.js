import axios from 'axios';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage.js';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

/**
 * Normalizes an API base URL:
 * - Trims trailing slashes
 * - Automatically appends /api/v1 if missing on absolute HTTP/HTTPS URLs
 */
export const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string') return '/api/v1';
  let clean = url.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(clean) && !clean.endsWith('/api/v1')) {
    clean = `${clean}/api/v1`;
  }
  return clean;
};

/**
 * Returns the effective API base URL in order of priority:
 * 1. Runtime override in localStorage (VITE_API_BASE_URL or API_BASE_URL)
 * 2. Vite build-time environment variable (import.meta.env.VITE_API_BASE_URL or VITE_API_URL)
 * 3. Localhost fallback (http://127.0.0.1:8080/api/v1) or relative /api/v1
 */
export const getApiBaseUrl = () => {
  if (isBrowser) {
    const runtimeUrl = localStorage.getItem('VITE_API_BASE_URL') || localStorage.getItem('API_BASE_URL');
    if (runtimeUrl && runtimeUrl.trim()) {
      const normalizedRuntimeUrl = normalizeApiUrl(runtimeUrl);
      const staleLocalBackend = /^http:\/\/(localhost|127\.0\.0\.1):8000\/api\/v1$/i.test(normalizedRuntimeUrl);
      if (isLocalhost && staleLocalBackend) {
        const migratedUrl = 'http://127.0.0.1:8080/api/v1';
        localStorage.setItem('VITE_API_BASE_URL', migratedUrl);
        localStorage.setItem('API_BASE_URL', migratedUrl);
        return migratedUrl;
      }
      return normalizedRuntimeUrl;
    }
  }

  const envUrl = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL);
  if (envUrl && envUrl.trim()) {
    const normalizedEnvUrl = normalizeApiUrl(envUrl);
    const staleLocalBackend = /^http:\/\/(localhost|127\.0\.0\.1):8000\/api\/v1$/i.test(normalizedEnvUrl);
    if (isLocalhost && staleLocalBackend) return 'http://127.0.0.1:8080/api/v1';
    return normalizedEnvUrl;
  }

  return isLocalhost ? 'http://127.0.0.1:8080/api/v1' : '/api/v1';
};

/**
 * Allows updating the API base URL at runtime and caches it in localStorage.
 */
export const setApiBaseUrl = (url) => {
  if (isBrowser) {
    if (!url || !url.trim()) {
      localStorage.removeItem('VITE_API_BASE_URL');
      localStorage.removeItem('API_BASE_URL');
    } else {
      const normalized = normalizeApiUrl(url);
      localStorage.setItem('VITE_API_BASE_URL', normalized);
      localStorage.setItem('API_BASE_URL', normalized);
      axiosInstance.defaults.baseURL = normalized;
      return normalized;
    }
  }
  return getApiBaseUrl();
};

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to ensure dynamic baseURL is always current and attach auth token
axiosInstance.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = getItem(STORAGE_KEYS.TOKEN, null);
  const isPublicAuthRequest = /\/auth\/(login|login\/form|setup-admin|register|refresh|check-admin)/.test(config.url || '');
  if (typeof token === 'string' && token.startsWith('demo_jwt_token_')) {
    removeItem(STORAGE_KEYS.CURRENT_USER);
    removeItem(STORAGE_KEYS.TOKEN);
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!isPublicAuthRequest && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    if (!isPublicAuthRequest) {
      return Promise.reject(new Error('This preview session cannot access the live backend. Please sign in again.'));
    }
  }
  if (token) {
    if (!(typeof token === 'string' && token.startsWith('demo_jwt_token_'))) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Track whether a token refresh is already in progress to avoid multiple refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Interceptor for 401 auto-refresh AND user-friendly error messages
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const isPublicAuthRequest = /\/auth\/(login|login\/form|setup-admin|register|refresh|check-admin)/.test(originalRequest?.url || '');

    // Auto-refresh on 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN, null);
      if (refreshToken) {
        if (isRefreshing) {
          // Queue this request until the refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResp = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
            refresh_token: refreshToken,
          }, { headers: { 'Content-Type': 'application/json' } });

          const newToken = refreshResp.data.access_token;
          setItem(STORAGE_KEYS.TOKEN, newToken);
          if (refreshResp.data.refresh_token) {
            setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshResp.data.refresh_token);
          }

          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          // Refresh failed — clear session and redirect to login
          removeItem(STORAGE_KEYS.CURRENT_USER);
          removeItem(STORAGE_KEYS.TOKEN);
          removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // If no refresh token exists, do not leave the user in a portal with a
    // rejected session. Clear the stale credentials and return to sign-in.
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      removeItem(STORAGE_KEYS.CURRENT_USER);
      removeItem(STORAGE_KEYS.TOKEN);
      removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      error.message = isDeployed
        ? 'The backend server took too long to respond. Please check your deployed Railway service.'
        : 'The server took too long to respond. Please ensure the Java backend is running at http://127.0.0.1:8080.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = isDeployed
        ? 'Cannot reach live backend API. Connect your Railway backend URL via VITE_API_BASE_URL in Netlify site settings.'
        : 'Unable to reach the backend server. Please verify the Java backend is running at http://127.0.0.1:8080.';
    } else if (error.response?.status === 404 && isDeployed) {
      const isHtmlResponse = typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE');
      if (isHtmlResponse || !error.response.data?.detail) {
        error.message = 'Live backend is not connected. The request reached Netlify instead of Railway (404). Configure your Railway backend URL in Netlify settings or via the API settings on the login page.';
      }
    }
    return Promise.reject(error);
  }
);

// Local state mock adapter that handles local data operations while mirroring REST API behavior
export const mockApiCall = async (action, delayMs = 200) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = action();
        resolve({ success: true, data: result });
      } catch (err) {
        console.error('Local API Simulation Error:', err);
        reject({ success: false, error: err.message || 'Operation failed' });
      }
    }, delayMs);
  });
};
