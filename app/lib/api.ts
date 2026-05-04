import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearAuthStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('authUser');
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      const status = error.response?.status;
      const url = originalRequest?.url || '';

      const isAuthEndpoint =
        url.includes('/auth/login/') ||
        url.includes('/auth/register/') ||
        url.includes('/auth/google/') ||
        url.includes('/auth/refresh/');

      if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
        throw error;
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        clearAuthStorage();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw error;
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (!originalRequest.headers) {
              originalRequest.headers = {} as InternalAxiosRequestConfig['headers'];
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const newAccessToken = refreshResponse.data?.access || refreshResponse.data?.access_token;
        const newRefreshToken = refreshResponse.data?.refresh;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint.');
        }

        localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        notifyRefreshSubscribers(newAccessToken);

        if (!originalRequest.headers) {
          originalRequest.headers = {} as InternalAxiosRequestConfig['headers'];
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    },
  );
}

export const authService = {
  googleLogin: (credential: string) => api.post('/auth/google/', { credential }),
  register: (data: unknown) => api.post('/auth/register/', data),
  login: async (email: string, password: string) => {
    try {
      return await api.post('/auth/login/', { email, password });
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // Backward compatibility: some auth backends still expect `username`.
      if (status === 401) {
        return api.post('/auth/login/', { username: email, password });
      }

      throw error;
    }
  },
  getCurrentUser: () => api.get('/auth/me/'),
};

export const appointmentService = {
  getAll: () => api.get('/appointments/'),
  create: (data: unknown) => api.post('/appointments/', data),
  getById: (id: string) => api.get(`/appointments/${id}/`),
  update: (id: string, data: unknown) => api.patch(`/appointments/${id}/`, data),
  pendingMatching: () => api.get('/appointments/pending-matching/'),
  suggestNurse: (id: string, suggestedNurse: string) =>
    api.post(`/appointments/${id}/suggest-nurse/`, { suggested_nurse: suggestedNurse }),
  decision: (id: string, decision: 'APPROVED' | 'REJECTED', rejectionReason?: string) =>
    api.post(`/appointments/${id}/decision/`, {
      decision,
      ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
    }),
  confirm: (id: string) => api.post(`/appointments/${id}/confirm/`),
  cancel: (id: string) => api.post(`/appointments/${id}/cancel/`),
};

export const notificationService = {
  getAll: (isRead?: boolean) =>
    api.get('/notifications/', {
      params: typeof isRead === 'boolean' ? { is_read: isRead } : undefined,
    }),
  markRead: (id: string) => api.post(`/notifications/${id}/mark-read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
  unreadCount: () => api.get('/notifications/unread-count/'),
};

export const nurseService = {
  getAll: (professionalType?: string) =>
    api.get('/nurses/', {
      params: professionalType ? { professional_type: professionalType } : undefined,
    }),
};

export const familyMemberService = {
  getAll: () => api.get('/family-members/'),
  create: (data: unknown) => api.post('/family-members/', data),
  getById: (id: string) => api.get(`/family-members/${id}/`),
  update: (id: string, data: unknown) => api.patch(`/family-members/${id}/`, data),
  delete: (id: string) => api.delete(`/family-members/${id}/`),
};

export default api;
