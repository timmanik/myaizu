import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '../services/api/collections';
import type { CreateCollectionDto } from '@aizu/shared';

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionDto) => collectionsApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

