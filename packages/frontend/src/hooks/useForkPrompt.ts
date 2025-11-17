import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi } from '../services/api/prompts';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export const useForkPrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (promptId: string) => promptsApi.fork(promptId),
    onSuccess: (response) => {
      // Invalidate prompts queries
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      
      toast({
        title: 'Success',
        description: 'Prompt remixed successfully! Opening in editor...',
      });

      // Navigate to the edit page for the new forked prompt
      const forkedPrompt = response.data;
      if (!forkedPrompt) {
        return;
      }

      setTimeout(() => {
        navigate(`/prompts/${forkedPrompt.id}/edit`);
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remix prompt',
        variant: 'destructive',
      });
    },
  });
};
