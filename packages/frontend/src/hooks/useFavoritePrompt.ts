import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';

export const useFavoritePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promptsApi.toggleFavorite(id),
    onSuccess: () => {
      // Invalidate prompts list to update UI
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

