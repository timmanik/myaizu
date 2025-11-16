import axios from 'axios';
import type { Role } from '@aizu/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Invite {
  id: string;
  token: string;
  email: string;
  role: Role;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  createdBy: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateInviteDto {
  email: string;
  role: Role;
}

/**
 * Create a new invite (Super Admin only)
 */
export const createInvite = async (data: CreateInviteDto): Promise<Invite> => {
  const response = await api.post('/api/invites/admin', data);
  return response.data.data;
};

/**
 * Get all invites (Super Admin only)
 */
export const getAllInvites = async (): Promise<Invite[]> => {
  const response = await api.get('/api/invites/admin');
  return response.data.data;
};

/**
 * Revoke an invite (Super Admin only)
 */
export const revokeInvite = async (inviteId: string): Promise<void> => {
  await api.delete(`/api/invites/admin/${inviteId}`);
};

/**
 * Validate an invite token (public endpoint)
 */
export const validateInvite = async (
  token: string
): Promise<{
  valid: boolean;
  email?: string;
  role?: Role;
  error?: string;
}> => {
  const response = await api.get(`/api/invites/${token}/validate`);
  return response.data;
};

/**
 * Accept an invite and create account (public endpoint)
 */
export const acceptInvite = async (data: {
  token: string;
  name: string;
  password: string;
}): Promise<{ user: any; token: string }> => {
  const response = await api.post(`/api/invites/${data.token}/accept`, {
    name: data.name,
    password: data.password,
  });
  return response.data.data;
};

