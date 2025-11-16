import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import { useToast } from './use-toast';
import type { UpdateTeamMemberRoleDto } from '@aizu/shared';

export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      teamId, 
      userId, 
      data 
    }: { 
      teamId: string; 
      userId: string; 
      data: UpdateTeamMemberRoleDto;
    }) =>
      teamsApi.updateTeamMemberRole(teamId, userId, data),
    onSuccess: (_, variables) => {
      // Invalidate team queries to refresh member list
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      
      toast({
        title: 'Success',
        description: 'Team member role updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update member role',
        variant: 'destructive',
      });
    },
  });
};

