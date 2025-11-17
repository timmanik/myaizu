import axios from 'axios';
import type { Organization, UpdateOrganizationDto } from '@aizu/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
 * Get organization settings
 */
export const getOrganization = async (): Promise<Organization> => {
  const response = await api.get('/organization');
  // Using axios directly: response.data is the backend response { success, data }
  return response.data.data;
};

/**
 * Update organization settings (Super Admin only)
 */
export const updateOrganization = async (
  data: UpdateOrganizationDto
): Promise<Organization> => {
  const response = await api.put('/organization', data);
  return response.data.data;
};

