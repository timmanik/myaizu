import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import { useToast } from './use-toast';

export const useUnpinPrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, promptId }: { teamId: string; promptId: string }) =>
      teamsApi.unpinPrompt(teamId, promptId),
    onSuccess: (_, variables) => {
      // Invalidate team and pinned prompts queries
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-pinned-prompts', variables.teamId] });
      
      toast({
        title: 'Success',
        description: 'Prompt unpinned successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to unpin prompt',
        variant: 'destructive',
      });
    },
  });
};

