import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';
import type { TeamPromptsFilters } from '@aizu/shared';

export const useTeamPrompts = (teamId: string, filters?: TeamPromptsFilters) => {
  return useQuery({
    queryKey: ['team-prompts', teamId, filters],
    queryFn: () => teamsApi.getTeamPrompts(teamId, filters),
    enabled: !!teamId,
  });
};

