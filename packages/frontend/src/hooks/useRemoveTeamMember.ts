import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import { useToast } from './use-toast';

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsApi.removeTeamMember(teamId, userId),
    onSuccess: (_, variables) => {
      // Invalidate team queries to refresh member list
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove team member',
        variant: 'destructive',
      });
    },
  });
};

