import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1209/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Bearer token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error structure for consistent handling
    const normalized = {
      status: error.response?.status || 0,
      data: error.response?.data || { message: error.message },
      message: error.response?.data?.message || error.message || 'Network error',
    };
    return Promise.reject(normalized);
  }
);

export default axiosClient;
export { API_BASE_URL };
