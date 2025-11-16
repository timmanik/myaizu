import axios from 'axios';
import type {
  AdminStats,
  CreateTeamDto,
  UpdateTeamDto,
  TeamWithDetails,
  AssignTeamAdminDto,
  UserWithStats,
  UpdateUserRoleDto,
  UserFilters,
} from '@aizu/shared';

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

/**
 * STATISTICS
 */

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/api/admin/stats');
  return response.data.data;
};

/**
 * TEAM MANAGEMENT
 */

export const createTeam = async (data: CreateTeamDto): Promise<TeamWithDetails> => {
  const response = await api.post('/api/admin/teams', data);
  return response.data.data;
};

export const getAllTeams = async (search?: string): Promise<TeamWithDetails[]> => {
  const response = await api.get('/api/admin/teams', {
    params: { search },
  });
  return response.data.data;
};

export const updateTeam = async (
  teamId: string,
  data: UpdateTeamDto
): Promise<TeamWithDetails> => {
  const response = await api.put(`/api/admin/teams/${teamId}`, data);
  return response.data.data;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  await api.delete(`/api/admin/teams/${teamId}`);
};

export const assignTeamAdmin = async (
  teamId: string,
  data: AssignTeamAdminDto
): Promise<any> => {
  const response = await api.post(`/api/admin/teams/${teamId}/admins`, data);
  return response.data.data;
};

export const removeTeamAdmin = async (teamId: string, userId: string): Promise<any> => {
  const response = await api.delete(`/api/admin/teams/${teamId}/admins/${userId}`);
  return response.data.data;
};

/**
 * USER MANAGEMENT
 */

export const getAllUsers = async (filters?: UserFilters): Promise<UserWithStats[]> => {
  const response = await api.get('/api/admin/users', {
    params: filters,
  });
  return response.data.data;
};

export const updateUserRole = async (
  userId: string,
  data: UpdateUserRoleDto
): Promise<UserWithStats> => {
  const response = await api.put(`/api/admin/users/${userId}/role`, data);
  return response.data.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/api/admin/users/${userId}`);
};

/**
 * INVITE MANAGEMENT
 * Note: These are already in invites.ts, but re-exported here for convenience
 */

export { getAllInvites, revokeInvite } from './invites';

