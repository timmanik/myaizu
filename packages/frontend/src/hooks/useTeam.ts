import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../services/api/teams';

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsApi.getTeamById(id),
    enabled: !!id,
  });
};

