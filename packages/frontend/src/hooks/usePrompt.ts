import { useQuery } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';

export const usePrompt = (id: string | undefined) => {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: () => {
      if (!id) throw new Error('Prompt ID is required');
      return promptsApi.get(id);
    },
    enabled: !!id,
  });
};

