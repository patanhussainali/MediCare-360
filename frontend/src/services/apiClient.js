import axios from 'axios';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

// Base Axios instance configured for future FastAPI backend integration
const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000/api/v1';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for attaching auth token
axiosInstance.interceptors.request.use((config) => {
  const token = getItem(STORAGE_KEYS.TOKEN, null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

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
