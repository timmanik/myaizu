import { useQuery } from '@tanstack/react-query';
import {
  getMostFavorited,
  getFastRising,
  getNewPrompts,
  getTrendingOverview,
} from '../services/api/trending';

/**
 * Hook to fetch most favorited prompts
 */
export function useMostFavorited(days: number = 7, limit: number = 20) {
  return useQuery({
    queryKey: ['trending', 'most-favorited', days, limit],
    queryFn: () => getMostFavorited(days, limit),
  });
}

/**
 * Hook to fetch fast rising prompts
 */
export function useFastRising(days: number = 7, limit: number = 20) {
  return useQuery({
    queryKey: ['trending', 'fast-rising', days, limit],
    queryFn: () => getFastRising(days, limit),
  });
}

/**
 * Hook to fetch new prompts
 */
export function useNewPrompts(limit: number = 20) {
  return useQuery({
    queryKey: ['trending', 'new', limit],
    queryFn: () => getNewPrompts(limit),
  });
}

/**
 * Hook to fetch trending overview (all categories)
 */
export function useTrendingOverview() {
  return useQuery({
    queryKey: ['trending', 'overview'],
    queryFn: getTrendingOverview,
  });
}


