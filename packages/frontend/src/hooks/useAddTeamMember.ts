import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import { useToast } from './use-toast';
import type { AddTeamMemberDto } from '@aizu/shared';

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMemberDto }) =>
      teamsApi.addTeamMember(teamId, data),
    onSuccess: (_, variables) => {
      // Invalidate team queries to refresh member list
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      
      toast({
        title: 'Success',
        description: 'Team member added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add team member',
        variant: 'destructive',
      });
    },
  });
};

