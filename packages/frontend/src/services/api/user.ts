import { apiClient } from './client';
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
  PublicUserProfile,
  Prompt,
} from '@aizu/shared';

/**
 * Get current user's profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get('/user/profile');
  return response.data.user;
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(data: UpdateProfileDto): Promise<UserProfile> {
  const response = await apiClient.put('/user/profile', data);
  return response.data.user;
}

/**
 * Change current user's password
 */
export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await apiClient.post('/user/change-password', data);
}

/**
 * Get public profile of a user
 */
export async function getPublicProfile(userId: string): Promise<PublicUserProfile> {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data.user;
}

/**
 * Get user's public prompts
 */
export async function getUserPublicPrompts(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const response = await apiClient.get(`/users/${userId}/prompts`, {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Get user's public collections
 */
export async function getUserPublicCollections(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const response = await apiClient.get(`/users/${userId}/collections`, {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Get current user's pinned prompts
 */
export async function getPinnedPrompts(): Promise<Prompt[]> {
  const response = await apiClient.get<{ data: Prompt[] }>('/user/me/pinned');
  return response.data || [];
}

/**
 * Pin a prompt to user's home page
 */
export async function pinPrompt(promptId: string): Promise<void> {
  await apiClient.post('/user/me/pin', { promptId });
}

/**
 * Unpin a prompt from user's home page
 */
export async function unpinPrompt(promptId: string): Promise<void> {
  await apiClient.delete(`/user/me/pin/${promptId}`);
}

