import { apiClient } from './client';
import type { User } from '@aizu/shared';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  inviteToken: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response;
  },

  validateInvite: async (token: string) => {
    const response = await apiClient.get<{
      valid: boolean;
      email?: string;
      role?: string;
      error?: string;
    }>(`/invites/${token}/validate`);
    return response;
  },
};

