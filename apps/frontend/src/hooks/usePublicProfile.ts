import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../services/api/user';
import type { PublicUserProfile } from '@aizu/shared';

export function usePublicProfile(userId: string) {
  return useQuery<PublicUserProfile>({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => getPublicProfile(userId),
    enabled: !!userId,
  });
}
