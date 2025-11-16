import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';

export const usePinnedPrompts = (teamId: string, viewAsPublic?: boolean) => {
  return useQuery({
    queryKey: ['team-pinned-prompts', teamId, viewAsPublic],
    queryFn: () => teamsApi.getPinnedPrompts(teamId, viewAsPublic),
    enabled: !!teamId,
  });
};

