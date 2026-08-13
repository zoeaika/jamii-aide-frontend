import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

const normalizeApiBaseUrl = (url: string) => url.trim().replace(/\/+$/, '');

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || getDefaultApiBaseUrl());
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
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
  role: string;
  account_type?: string;
  organization_name?: string;
  profile_image?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  verification_status?: string | null;
  status?: string | null;
  created_at?: string;
};

export type AdminUserRecord = AuthUser;

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
  is_accepting_requests?: boolean;
  availability_status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'OFF_DUTY';
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type AvailabilitySlotRecord = {
  id: string;
  nurse?: string;
  day_of_week: number;
  day_of_week_display?: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
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

export const getRoleValue = (resource?: Record<string, unknown> | null) => {
  if (!resource || typeof resource !== 'object') {
    return '';
  }

  const organizationIndicators = [
    resource.organization_name,
    resource.organization_id,
    resource.organization,
    resource.organization_admin,
    resource.organization_profile,
    resource.is_organization_admin,
    resource.is_org_admin,
  ];

  if (organizationIndicators.some((value) => Boolean(value))) {
    return 'ORGANIZATION_ADMIN';
  }

  const accountType = [resource.account_type, resource.accountType, resource.type, resource.kind].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );
  if (accountType) {
    const normalizedAccountType = accountType.toUpperCase();
    if (normalizedAccountType.includes('ORG') || normalizedAccountType.includes('ORGANIZATION')) {
      return 'ORGANIZATION_ADMIN';
    }
    if (normalizedAccountType.includes('NURSE')) {
      return 'NURSE';
    }
  }

  const directRole = [
    resource.role,
    resource.raw_role,
    resource.role_name,
    resource.user_type,
    resource.account_type,
    resource.accountType,
    resource.type,
    resource.kind,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  if (directRole) {
    return directRole.trim();
  }

  const nestedUser = resource.user;
  if (nestedUser && typeof nestedUser === 'object') {
    const nestedRole = getRoleValue(nestedUser as Record<string, unknown>);
    if (nestedRole) {
      return nestedRole;
    }
  }

  return '';
};

export const isNurseRole = (role?: string) => {
  const normalizedRole = String(role || '')
    .trim()
    .toUpperCase();
  return normalizedRole === 'NURSE' || normalizedRole === 'HEALTHCARE_NURSE' || normalizedRole.includes('NURSE');
};

export const isOrganizationRole = (role?: string) => {
  const normalizedRole = String(role || '')
    .trim()
    .toUpperCase();

  return Boolean(
    normalizedRole === 'ORGANIZATION_ADMIN' ||
    normalizedRole === 'ORGANIZATION' ||
    normalizedRole === 'ORG_ADMIN' ||
    normalizedRole === 'ORG' ||
    normalizedRole === 'ORGANISATION_ADMIN' ||
    normalizedRole === 'ORGANISATION' ||
    normalizedRole.includes('ORGANIZATION') ||
    normalizedRole.includes('ORG_ADMIN') ||
    normalizedRole.includes('ORG') ||
    normalizedRole.includes('ADMIN') && normalizedRole.includes('ORG'),
  );
};

export const getAccountVerificationState = (user?: Partial<AuthUser> | null) => {
  const normalizedRole = String(getRoleValue(user as Record<string, unknown>) || '')
    .trim()
    .toUpperCase();
  const requiresReview = isNurseRole(normalizedRole) || isOrganizationRole(normalizedRole);
  const explicitStatus = String(user?.verification_status || user?.status || '')
    .trim()
    .toUpperCase();
  const isVerified = user?.is_verified === true;
  const isActive = user?.is_active === true;
  const isPending = requiresReview
    && (!isVerified || !isActive || ['PENDING', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'AWAITING_APPROVAL'].includes(explicitStatus));

  return {
    requiresReview,
    isPending,
    isApproved: requiresReview ? Boolean(isVerified && isActive) : true,
    status: explicitStatus || (isPending ? 'PENDING' : 'APPROVED'),
  };
};

export const persistAuthSession = (payload: {
  access_token?: string;
  access?: string;
  refresh_token?: string;
  refresh?: string;
  user?: AuthUser;
  account_type?: string;
  accountType?: string;
  role?: string;
  raw_role?: string;
  organization_name?: string;
  organization_display_name?: string;
  business_name?: string;
  is_organization_admin?: boolean;
  is_org_admin?: boolean;
  [key: string]: unknown;
}) => {
  const accessToken = payload.access_token || payload.access;
  const refreshToken = payload.refresh_token || payload.refresh;
  const user = payload.user;
  if (!accessToken || !refreshToken || !user) {
    throw new Error('Invalid auth response. Missing tokens or user payload.');
  }

  const rawStoredRole = String(
    getRoleValue(user as Record<string, unknown>) ||
    getRoleValue(payload as Record<string, unknown>) ||
    payload.role ||
    payload.raw_role ||
    ''
  ).trim();

  const accountType = String(
    payload.account_type ||
    payload.accountType ||
    (typeof payload.user === 'object' && payload.user ? String((payload.user as Record<string, unknown>).account_type || '') : '') ||
    ''
  ).trim().toUpperCase();

  const hasOrgFields = Boolean(
    payload.organization_name ||
    payload.organization_display_name ||
    payload.business_name ||
    payload.is_organization_admin ||
    payload.is_org_admin ||
    (typeof payload.user === 'object' && payload.user && ((payload.user as Record<string, unknown>).organization_name || (payload.user as Record<string, unknown>).organization_display_name || (payload.user as Record<string, unknown>).business_name || (payload.user as Record<string, unknown>).is_organization_admin || (payload.user as Record<string, unknown>).is_org_admin))
  );
  const hasNurseFields = Boolean(
    accountType.includes('NURSE') || (typeof payload.user === 'object' && payload.user && ((payload.user as Record<string, unknown>).account_type || '').toString().toUpperCase().includes('NURSE'))
  );

  const normalizedStoredRole = rawStoredRole.toUpperCase();
  const isGenericUserRole = ['USER', 'CUSTOMER', 'FAMILY_USER'].includes(normalizedStoredRole);

  let resolvedRole = rawStoredRole;
  if (!resolvedRole || isGenericUserRole) {
    if (hasOrgFields || accountType.includes('ORG') || accountType.includes('ORGANIZATION')) {
      resolvedRole = 'ORGANIZATION_ADMIN';
    } else if (hasNurseFields || accountType.includes('NURSE')) {
      resolvedRole = 'NURSE';
    } else {
      resolvedRole = rawStoredRole || 'USER';
    }
  }
  const normalizedRole = resolvedRole.toUpperCase();

  const verificationState = getAccountVerificationState(user);
  const shouldDefaultToActive = !isNurseRole(normalizedRole) && !isOrganizationRole(normalizedRole);
  const userWithNormalizedRole = {
    ...user,
    role: normalizedRole,
    raw_role: resolvedRole,
    is_verified: user.is_verified ?? (shouldDefaultToActive || verificationState.isApproved),
    is_active: user.is_active ?? (shouldDefaultToActive || verificationState.isApproved),
    verification_status: user.verification_status || (verificationState.isPending ? 'PENDING' : 'APPROVED'),
    status: user.status || (verificationState.isPending ? 'PENDING_VERIFICATION' : 'ACTIVE'),
  };

  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(userWithNormalizedRole));
  localStorage.setItem('authUser', JSON.stringify(userWithNormalizedRole));

  return { accessToken, refreshToken, user: userWithNormalizedRole };
};

export const routeForRole = (role?: string) => {
  const normalizedRole = String(role || '')
    .trim()
    .toUpperCase();

  if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPERADMIN') {
    return '/admin/dashboard';
  }
  if (isOrganizationRole(normalizedRole)) {
    return '/dashboard/organization-admin';
  }
  if (isNurseRole(normalizedRole)) {
    return '/nurse/dashboard';
  }
  return '/dashboard';
};

export const isEndUserRole = (role?: string) => {
  const normalizedRole = String(role || '')
    .trim()
    .toUpperCase();
  return normalizedRole === 'USER' || normalizedRole === 'CUSTOMER' || normalizedRole === 'FAMILY_USER';
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
      if (error.code === 'ECONNABORTED') {
        error.message = `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Check backend availability and API URL.`;
      }

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
  decision: async (
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
    assignedNurseId?: string,
  ) => {
    const rejectionPayload = rejectionReason ? { rejection_reason: rejectionReason } : {};
    const assignedNursePayload = assignedNurseId ? { assigned_nurse: assignedNurseId } : {};
    const nursePayload = assignedNurseId ? { nurse: assignedNurseId } : {};
    const attempts: Array<{
      method: 'post' | 'patch';
      url: string;
      payload: Record<string, unknown>;
    }> = [
      {
        method: 'post',
        url: `/appointments/${id}/decision/`,
        payload: { decision, ...rejectionPayload, ...assignedNursePayload },
      },
      {
        method: 'post',
        url: `/appointments/${id}/decision/`,
        payload: { status: decision, ...rejectionPayload, ...assignedNursePayload },
      },
      {
        method: 'post',
        url: `/appointments/${id}/decision/`,
        payload: { decision, ...rejectionPayload, ...nursePayload },
      },
      {
        method: 'patch',
        url: `/appointments/${id}/`,
        payload: { status: decision, ...rejectionPayload, ...assignedNursePayload },
      },
      {
        method: 'patch',
        url: `/appointments/${id}/`,
        payload: { status: decision, ...rejectionPayload, ...nursePayload },
      },
    ];

    let lastError: unknown;

    for (let index = 0; index < attempts.length; index += 1) {
      const attempt = attempts[index];
      try {
        if (attempt.method === 'post') {
          return await api.post(attempt.url, attempt.payload);
        }
        return await api.patch(attempt.url, attempt.payload);
      } catch (error) {
        lastError = error;
        const status = (error as AxiosError)?.response?.status;
        const canTryFallback = status === 400 || status === 404 || status === 405;
        const hasMoreAttempts = index < attempts.length - 1;

        if (!canTryFallback || !hasMoreAttempts) {
          throw error;
        }
      }
    }

    throw lastError;
  },
  confirm: (id: string) => api.post(`/appointments/${id}/confirm/`),
  cancel: (id: string) => api.post(`/appointments/${id}/cancel/`),
  reschedule: (id: string, data: { appointment_date: string; start_time: string; end_time: string }) =>
    api.post(`/appointments/${id}/reschedule/`, data),
  noShow: (id: string) => api.post(`/appointments/${id}/no-show/`),
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
  me: () => api.get('/nurses/me/'),
  update: (id: string, data: unknown) => api.patch(`/nurses/${id}/`, data),
  toggleAvailability: (id: string, isAcceptingRequests?: boolean) =>
    api.post(`/nurses/${id}/toggle-availability/`, isAcceptingRequests === undefined ? {} : { is_accepting_requests: isAcceptingRequests }),
  getAvailability: (id: string) => api.get(`/nurses/${id}/availability/`),
};

export const availabilitySlotService = {
  getAll: () => api.get('/availability-slots/'),
  create: (data: { day_of_week: number; start_time: string; end_time: string; is_available?: boolean }) =>
    api.post('/availability-slots/', data),
  update: (id: string, data: Partial<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>) =>
    api.patch(`/availability-slots/${id}/`, data),
  remove: (id: string) => api.delete(`/availability-slots/${id}/`),
};

export const endUserService = {
  getAll: () => api.get('/end-users/'),
};

export const adminUserService = {
  getAll: (search?: string) =>
    api.get('/admin/users/', {
      params: search ? { search } : undefined,
    }),
  changeRole: (id: string, role: string) => api.post(`/admin/users/${id}/change-role/`, { role }),
  approve: (id: string) => api.post(`/admin/users/${id}/approve/`),
  reject: (id: string, reason?: string) =>
    api.post(`/admin/users/${id}/reject/`, reason ? { reason } : {}),
};

export const adminOrganizationService = {
  getAll: () => api.get('/admin/organizations/'),
  create: (data: unknown) => api.post('/admin/organizations/', data),
  update: (id: string, data: unknown) => api.patch(`/admin/organizations/${id}/`, data),
  approve: (id: string) => api.patch(`/admin/organizations/${id}/`, {
    is_active: true,
    is_verified: true,
    verification_status: 'APPROVED',
    status: 'ACTIVE',
  }),
  reject: (id: string, reason?: string) => api.patch(`/admin/organizations/${id}/`, {
    is_active: false,
    is_verified: false,
    verification_status: 'REJECTED',
    status: 'REJECTED',
    rejection_reason: reason || null,
  }),
};

export const organizationAdminService = {
  getAll: () => api.get('/admin/organization-admins/'),
  create: (data: unknown) => api.post('/admin/organization-admins/', data),
  me: () => api.get('/admin/organization-admins/me/'),
};

export const nurseEarningService = {
  getAll: () => api.get('/nurse-earnings/'),
  create: (data: unknown) => api.post('/nurse-earnings/', data),
  update: (id: string, data: unknown) => api.patch(`/nurse-earnings/${id}/`, data),
  markPaid: (id: string) => api.post(`/nurse-earnings/${id}/mark-paid/`),
};

export const familyMemberService = {
  getAll: () => api.get('/family-members/'),
  getById: (id: string) => api.get(`/family-members/${id}/`),
  create: (data: unknown) => api.post('/family-members/', data),
};

export const paymentService = {
  getAll: () => api.get('/payments/'),
  create: (data: { amount: number; method: 'MPESA' | 'CARD' | 'BANK_TRANSFER'; appointment_ids?: string[] }) =>
    api.post('/payments/', data),
  getById: (id: string) => api.get(`/payments/${id}/`),
  refund: (id: string) => api.post(`/payments/${id}/refund/`),
  getStats: () => api.get('/payments/stats/'),
};

export default api;
