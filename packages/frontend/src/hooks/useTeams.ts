import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import type { TeamFilters } from '@aizu/shared';

export const useTeams = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: ['teams', filters],
    queryFn: () => teamsApi.getTeams(filters),
  });
};

