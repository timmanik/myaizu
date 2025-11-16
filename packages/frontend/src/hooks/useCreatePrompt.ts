import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';
import type { CreatePromptDto } from '@aizu/shared';

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptDto) => promptsApi.create(data),
    onSuccess: async () => {
      // Invalidate and refetch prompts list
      await queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

