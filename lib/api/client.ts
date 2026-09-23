import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Storage keys for auth persistence
 */
export const AUTH_STORAGE_KEY = 'admin_auth_user';
export const TOKEN_STORAGE_KEY = 'admin_access_token';

/**
 * Single Axios client instance configured for DummyJSON API.
 * All API modules (auth.ts, products.ts) import and use this client.
 */
export const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor:
 * Automatically reads the access token from localStorage (when running in browser)
 * and attaches it as a Bearer token in the Authorization header.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Global error handler. If any API endpoint returns 401 Unauthorized,
 * we clear the stored credentials and redirect the user back to /login.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        // Avoid infinite redirect loop if already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?session_expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);
