import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';

export const usePinnedPrompts = (teamId: string) => {
  return useQuery({
    queryKey: ['team-pinned-prompts', teamId],
    queryFn: () => teamsApi.getPinnedPrompts(teamId),
    enabled: !!teamId,
  });
};

