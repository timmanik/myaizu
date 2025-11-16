import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../services/api/user';

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => getPublicProfile(userId),
    enabled: !!userId,
  });
}

