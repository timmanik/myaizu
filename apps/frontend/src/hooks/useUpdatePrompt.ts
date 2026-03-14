import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';
import type { UpdatePromptDto } from '@aizu/shared';

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromptDto }) =>
      promptsApi.update(id, data),
    onSuccess: async (response) => {
      // Invalidate and refetch prompts list
      await queryClient.invalidateQueries({ queryKey: ['prompts'] });
      // Invalidate specific prompt
      if (response.data) {
        await queryClient.invalidateQueries({ queryKey: ['prompt', response.data.id] });
      }
    },
  });
};
