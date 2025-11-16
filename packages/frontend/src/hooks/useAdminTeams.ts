import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTeam,
  getAllTeams,
  updateTeam,
  deleteTeam,
  assignTeamAdmin,
  removeTeamAdmin,
} from '../services/api/admin';
import type { CreateTeamDto, UpdateTeamDto, AssignTeamAdminDto } from '@aizu/shared';

export const useAdminTeams = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'teams', search],
    queryFn: () => getAllTeams(search),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamDto) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeamDto }) =>
      updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useAssignTeamAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AssignTeamAdminDto }) =>
      assignTeamAdmin(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useRemoveTeamAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamAdmin(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

