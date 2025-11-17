import { useQuery } from '@tanstack/react-query';
import { getUserPublicCollections } from '../services/api/user';

type UserPublicCollectionsResult = Awaited<ReturnType<typeof getUserPublicCollections>>;

export function useUserPublicCollections(userId: string, page: number = 1, limit: number = 20) {
  return useQuery<UserPublicCollectionsResult>({
    queryKey: ['users', userId, 'collections', page, limit],
    queryFn: () => getUserPublicCollections(userId, page, limit),
    enabled: !!userId,
  });
}
