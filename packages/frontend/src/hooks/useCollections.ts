import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '../services/api/collections';
import type { CollectionFilters } from '@aizu/shared';

export const useCollections = (filters?: CollectionFilters) => {
  return useQuery({
    queryKey: ['collections', filters],
    queryFn: () => collectionsApi.getCollections(filters),
  });
};

