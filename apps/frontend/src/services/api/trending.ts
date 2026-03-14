import { apiClient } from './client';
import type { Prompt } from '@aizu/shared';

export interface TrendingOverview {
  mostFavorited: Prompt[];
  fastRising: Prompt[];
  new: Prompt[];
}

/**
 * Get most favorited prompts
 */
export async function getMostFavorited(days: number = 7, limit: number = 20): Promise<Prompt[]> {
  const params = new URLSearchParams();
  params.append('days', days.toString());
  params.append('limit', limit.toString());

  const response = await apiClient.get<Prompt[]>(`/trending/most-favorited?${params.toString()}`);
  if (!response.data) {
    throw new Error('Failed to load most favorited prompts');
  }
  return response.data;
}

/**
 * Get fast rising prompts
 */
export async function getFastRising(days: number = 7, limit: number = 20): Promise<Prompt[]> {
  const params = new URLSearchParams();
  params.append('days', days.toString());
  params.append('limit', limit.toString());

  const response = await apiClient.get<Prompt[]>(`/trending/fast-rising?${params.toString()}`);
  if (!response.data) {
    throw new Error('Failed to load fast rising prompts');
  }
  return response.data;
}

/**
 * Get new prompts
 */
export async function getNewPrompts(limit: number = 20): Promise<Prompt[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());

  const response = await apiClient.get<Prompt[]>(`/trending/new?${params.toString()}`);
  if (!response.data) {
    throw new Error('Failed to load new prompts');
  }
  return response.data;
}

/**
 * Get trending overview (all categories at once)
 */
export async function getTrendingOverview(): Promise<TrendingOverview> {
  const response = await apiClient.get<TrendingOverview>('/trending/overview');
  if (!response.data) {
    throw new Error('Failed to load trending overview');
  }
  return response.data;
}
