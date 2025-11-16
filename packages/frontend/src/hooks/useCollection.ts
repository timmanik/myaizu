import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '../services/api/collections';

export const useCollection = (id: string) => {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.getCollectionById(id),
    enabled: !!id,
  });
};

