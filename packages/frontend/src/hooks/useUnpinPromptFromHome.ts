import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unpinPrompt } from '@/services/api/user';
import { useToast } from '@/hooks/use-toast';

export const useUnpinPromptFromHome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (promptId: string) => unpinPrompt(promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pinned-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: 'Success',
        description: 'Prompt unpinned from your home page',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to unpin prompt',
        variant: 'destructive',
      });
    },
  });
};

