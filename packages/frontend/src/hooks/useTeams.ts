import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import type { TeamFilters, Team } from '@aizu/shared';

export const useTeams = (filters?: TeamFilters) => {
  return useQuery<Team[]>({
    queryKey: ['teams', filters],
    queryFn: () => teamsApi.getTeams(filters),
  });
};
