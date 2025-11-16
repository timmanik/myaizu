import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import { useToast } from './use-toast';

export const usePinPrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, promptId }: { teamId: string; promptId: string }) =>
      teamsApi.pinPrompt(teamId, promptId),
    onSuccess: (_, variables) => {
      // Invalidate team and pinned prompts queries
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['team-pinned-prompts', variables.teamId] });
      
      toast({
        title: 'Success',
        description: 'Prompt pinned successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to pin prompt',
        variant: 'destructive',
      });
    },
  });
};

