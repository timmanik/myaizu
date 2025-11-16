import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchResults } from '../services/api/search';

export function useSearch(query: string, enabled = true) {
  return useQuery<SearchResults>({
    queryKey: ['search', query],
    queryFn: () => searchApi.searchAll(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

