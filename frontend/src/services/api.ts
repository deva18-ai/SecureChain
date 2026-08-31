import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Token, ErrorResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; full_name: string; password: string; wallet_address?: string }) =>
    api.post<Token>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<Token>('/auth/login', data),
  me: () => api.get<import('../types').User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const usersApi = {
  list: (params?: { page?: number; page_size?: number; role?: string; is_active?: boolean; search?: string }) =>
    api.get<import('../types').PaginatedResponse<import('../types').User>>('/users', { params }),
  get: (id: number) => api.get<import('../types').User>(`/users/${id}`),
  update: (id: number, data: Partial<import('../types').User>) =>
    api.patch<import('../types').User>(`/users/${id}`, data),
  updateRole: (id: number, role: string) =>
    api.patch<import('../types').User>(`/users/${id}/role`, { role }),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const didsApi = {
  create: () => api.post<import('../types').DID>('/dids'),
  getMe: () => api.get<import('../types').DID>('/dids/me'),
  list: (params?: { page?: number; page_size?: number; verified?: boolean; search?: string }) =>
    api.get<import('../types').PaginatedResponse<import('../types').DID>>('/dids', { params }),
  get: (id: number) => api.get<import('../types').DID>(`/dids/${id}`),
  verify: (id: number) => api.post<import('../types').DID>(`/dids/${id}/verify`),
};

export const assetsApi = {
  create: (data: import('../types').AssetCreate) =>
    api.post<import('../types').Asset>('/assets', data),
  list: (params?: { page?: number; page_size?: number; status?: string; category?: string; owner_id?: number; search?: string }) =>
    api.get<import('../types').PaginatedResponse<import('../types').Asset>>('/assets', { params }),
  get: (id: number) => api.get<import('../types').Asset>(`/assets/${id}`),
  update: (id: number, data: import('../types').AssetUpdate) =>
    api.patch<import('../types').Asset>(`/assets/${id}`, data),
  allocate: (id: number, new_owner_id: number) =>
    api.post<import('../types').Asset>(`/assets/${id}/allocate`, { new_owner_id }),
  transfer: (id: number, new_owner_id: number) =>
    api.post<import('../types').Asset>(`/assets/${id}/transfer`, { new_owner_id }),
};

export const transfersApi = {
  create: (data: import('../types').TransferCreate) =>
    api.post<import('../types').Transfer>('/transfers', data),
  list: (params?: { page?: number; page_size?: number; status?: string; asset_id?: number }) =>
    api.get<import('../types').PaginatedResponse<import('../types').Transfer>>('/transfers', { params }),
  get: (id: number) => api.get<import('../types').Transfer>(`/transfers/${id}`),
  approve: (id: number) => api.post<import('../types').Transfer>(`/transfers/${id}/approve`),
  reject: (id: number, reason: string) =>
    api.post<import('../types').Transfer>(`/transfers/${id}/reject`, { reason }),
  cancel: (id: number) => api.post<import('../types').Transfer>(`/transfers/${id}/cancel`),
};

export const auditApi = {
  list: (params?: { page?: number; page_size?: number; action?: string; resource_type?: string; actor_id?: number; blockchain_verified?: boolean }) =>
    api.get<import('../types').PaginatedResponse<import('../types').AuditLog>>('/audit', { params }),
  get: (id: number) => api.get<import('../types').AuditLog>(`/audit/${id}`),
  verify: (data: import('../types').VerificationRequest) =>
    api.post<import('../types').VerificationResponse>('/audit/verify', data),
};

export const blockchainApi = {
  status: () => api.get<import('../types').BlockchainStatus>('/blockchain/status'),
  transaction: (txHash: string) => api.get<import('../types').BlockchainTransaction>(`/blockchain/transaction/${txHash}`),
  asset: (tokenId: number) => api.get(`/blockchain/assets/${tokenId}`),
  transactions: (params?: { page?: number; page_size?: number; from_address?: string; contract_address?: string }) =>
    api.get<import('../types').PaginatedResponse<import('../types').BlockchainTransaction>>('/blockchain/transactions', { params }),
};

export const dashboardApi = {
  stats: () => api.get<import('../types').DashboardStats>('/dashboard/stats'),
};

export default api;