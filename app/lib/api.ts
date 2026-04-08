import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getDefaultApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type AuthUser = {
  id: string;
  email: string;
  phone?: string | null;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'nurse' | 'admin' | string;
  profile_image?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
};

export type EndUserRecord = {
  id: string;
  user?: AuthUser;
  current_country?: string | null;
  current_city?: string | null;
  timezone?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NurseRecord = {
  id: string;
  user?: AuthUser;
  license_number?: string;
  license_expiry?: string;
  professional_type?: string | null;
  professional_type_display?: string;
  specializations?: string[];
  languages?: string[];
  years_experience?: number;
  bio?: string | null;
  certifications?: string | null;
  service_areas?: string | null;
  total_appointments?: number;
  completed_appointments?: number;
  rating?: number | string;
  total_reviews?: number;
  is_verified?: boolean;
  is_active?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export const clearAuthStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('authUser');
};

export const persistAuthSession = (payload: {
  access_token?: string;
  access?: string;
  refresh_token?: string;
  refresh?: string;
  user?: AuthUser;
}) => {
  const accessToken = payload.access_token || payload.access;
  const refreshToken = payload.refresh_token || payload.refresh;
  const user = payload.user;

  if (!accessToken || !refreshToken || !user) {
    throw new Error('Invalid auth response. Missing tokens or user payload.');
  }

  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('authUser', JSON.stringify(user));

  return { accessToken, refreshToken, user };
};

export const routeForRole = (role?: string) => {
  if (role === 'admin') {
    return '/admin/dashboard';
  }
  if (role === 'nurse') {
    return '/nurse/dashboard';
  }
  return '/dashboard';
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login/') ||
  url.includes('/auth/register/') ||
  url.includes('/auth/google/') ||
  url.includes('/auth/refresh/');

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    if (isAuthEndpoint(config.url || '')) {
      if (config.headers) {
        delete (config.headers as Record<string, unknown>).Authorization;
      }
      return config;
    }

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

      if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint(url)) {
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
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
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

export const endUserService = {
  getAll: () => api.get('/end-users/'),
};

export const familyMemberService = {
  getAll: () => api.get('/family-members/'),
  create: (data: unknown) => api.post('/family-members/', data),
};

export default api;
