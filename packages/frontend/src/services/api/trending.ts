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
export async function getMostFavorited(
  days: number = 7,
  limit: number = 20
): Promise<Prompt[]> {
  const params = new URLSearchParams();
  params.append('days', days.toString());
  params.append('limit', limit.toString());
  
  const response = await apiClient.get<Prompt[]>(`/trending/most-favorited?${params.toString()}`);
  // Trending endpoint returns array directly without wrapper
  return response as any as Prompt[];
}

/**
 * Get fast rising prompts
 */
export async function getFastRising(
  days: number = 7,
  limit: number = 20
): Promise<Prompt[]> {
  const params = new URLSearchParams();
  params.append('days', days.toString());
  params.append('limit', limit.toString());
  
  const response = await apiClient.get<Prompt[]>(`/trending/fast-rising?${params.toString()}`);
  // Trending endpoint returns array directly without wrapper
  return response as any as Prompt[];
}

/**
 * Get new prompts
 */
export async function getNewPrompts(limit: number = 20): Promise<Prompt[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  
  const response = await apiClient.get<Prompt[]>(`/trending/new?${params.toString()}`);
  // Trending endpoint returns array directly without wrapper
  return response as any as Prompt[];
}

/**
 * Get trending overview (all categories at once)
 */
export async function getTrendingOverview(): Promise<TrendingOverview> {
  const response = await apiClient.get<TrendingOverview>('/trending/overview');
  // Trending endpoint returns object directly without wrapper
  return response as any as TrendingOverview;
}

