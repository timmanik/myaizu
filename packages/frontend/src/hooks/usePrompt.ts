import { useQuery } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';

type PromptResponse = Awaited<ReturnType<typeof promptsApi.get>>;

export const usePrompt = (id: string | undefined) => {
  return useQuery<PromptResponse>({
    queryKey: ['prompt', id],
    queryFn: () => {
      if (!id) throw new Error('Prompt ID is required');
      return promptsApi.get(id);
    },
    enabled: !!id,
  });
};
