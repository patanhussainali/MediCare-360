import axios from 'axios';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://127.0.0.1:8000/api/v1';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor for attaching auth token
axiosInstance.interceptors.request.use((config) => {
  const token = getItem(STORAGE_KEYS.TOKEN, null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for user-friendly error messages on timeouts and network errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      error.message = 'The server took too long to respond. Please ensure the backend is running at http://127.0.0.1:8000.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = 'Unable to reach the backend server. Please verify the FastAPI backend is running at http://127.0.0.1:8000.';
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
