import axios from 'axios';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

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
 * 3. Localhost fallback (http://127.0.0.1:8000/api/v1) or relative /api/v1
 */
export const getApiBaseUrl = () => {
  if (isBrowser) {
    const runtimeUrl = localStorage.getItem('VITE_API_BASE_URL') || localStorage.getItem('API_BASE_URL');
    if (runtimeUrl && runtimeUrl.trim()) {
      return normalizeApiUrl(runtimeUrl);
    }
  }

  const envUrl = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL);
  if (envUrl && envUrl.trim()) {
    return normalizeApiUrl(envUrl);
  }

  return isLocalhost ? 'http://127.0.0.1:8000/api/v1' : '/api/v1';
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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for user-friendly error messages on timeouts, 404s, and network errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isDeployed = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      error.message = isDeployed
        ? 'The backend server took too long to respond. Please check your deployed Railway service.'
        : 'The server took too long to respond. Please ensure the backend is running at http://127.0.0.1:8000.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = isDeployed
        ? 'Cannot reach live backend API. Connect your Railway backend URL via VITE_API_BASE_URL in Netlify site settings.'
        : 'Unable to reach the backend server. Please verify the FastAPI backend is running at http://127.0.0.1:8000.';
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
