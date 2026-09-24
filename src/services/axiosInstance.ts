/**
 * Shared Axios instance for all API calls.
 *
 * - Request interceptor: attaches the auth token from localStorage to every request.
 * - Response interceptor: handles 401 (redirect to /login) and formats errors centrally.
 *
 * ALL API calls in this app must use this instance — never use raw fetch or a
 * separate axios instance in components or services.
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = 'https://dummyjson.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach the Bearer token to every outgoing request if one exists in localStorage.
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401 → clear token and redirect to /login.
// On any other error → normalise into a consistent { message } format.
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }

    // Normalise the error message so callers get a consistent string.
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
