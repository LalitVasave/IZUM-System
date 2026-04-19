import axios, { type InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/useAuthStore';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// Create a custom axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies (refresh_token) automatically
});

// Request interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401s and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    if (!originalRequest) return Promise.reject(error);

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a new access token using the httpOnly cookie (refresh_token)
        const refreshResponse = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        const { access_token } = refreshResponse.data;
        const user = useAuthStore.getState().user;
        
        // Update the store with the new access token
        if (user) {
          useAuthStore.getState().setAuth(access_token, user);
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token expired)
        useAuthStore.getState().clearAuth();
        // Only redirect if not already on login/register pages
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
