import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promptsApi.delete(id),
    onSuccess: () => {
      // Invalidate prompts list to refetch
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

