import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchUser } from '../services/api/search';

/**
 * Hook for searching users by name or email
 * @param query - Search query string
 * @param enabled - Whether the query should be enabled
 * @returns React Query result with user search results
 */
export function useUserSearch(query: string, enabled = true) {
  return useQuery<SearchUser[]>({
    queryKey: ['search', 'users', query],
    queryFn: () => searchApi.searchUsers(query, 10),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

