import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '../services/api/collections';
import type { UpdateCollectionDto } from '@aizu/shared';

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionDto }) =>
      collectionsApi.updateCollection(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', variables.id] });
    },
  });
};

