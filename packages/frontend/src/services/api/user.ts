import { apiClient } from './client';
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
  PublicUserProfile,
  Prompt,
  Collection,
} from '@aizu/shared';

interface UserPublicPromptsResponse {
  prompts: Prompt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserPublicCollectionsResponse {
  collections: Collection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get current user's profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<{ user: UserProfile }>('/user/profile');
  if (!response.data?.user) {
    throw new Error('Failed to load profile');
  }
  return response.data.user;
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(data: UpdateProfileDto): Promise<UserProfile> {
  const response = await apiClient.put<{ user: UserProfile }>('/user/profile', data);
  if (!response.data?.user) {
    throw new Error('Failed to update profile');
  }
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
  const response = await apiClient.get<{ user: PublicUserProfile }>(`/users/${userId}`);
  if (!response.data?.user) {
    throw new Error('User not found');
  }
  return response.data.user;
}

/**
 * Get user's public prompts
 */
export async function getUserPublicPrompts(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<UserPublicPromptsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await apiClient.get<UserPublicPromptsResponse>(
    `/users/${userId}/prompts?${params.toString()}`
  );
  if (!response.data) {
    throw new Error('Failed to load public prompts');
  }
  return response.data;
}

/**
 * Get user's public collections
 */
export async function getUserPublicCollections(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<UserPublicCollectionsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await apiClient.get<UserPublicCollectionsResponse>(
    `/users/${userId}/collections?${params.toString()}`
  );
  if (!response.data) {
    throw new Error('Failed to load public collections');
  }
  return response.data;
}

/**
 * Get current user's pinned prompts
 */
export async function getPinnedPrompts(): Promise<Prompt[]> {
  const response = await apiClient.get<Prompt[]>('/user/me/pinned');
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
