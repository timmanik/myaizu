import { useQuery } from '@tanstack/react-query';
import { getUserPublicPrompts } from '../services/api/user';

type UserPublicPromptsResult = Awaited<ReturnType<typeof getUserPublicPrompts>>;

export function useUserPublicPrompts(userId: string, page: number = 1, limit: number = 20) {
  return useQuery<UserPublicPromptsResult>({
    queryKey: ['users', userId, 'prompts', page, limit],
    queryFn: () => getUserPublicPrompts(userId, page, limit),
    enabled: !!userId,
  });
}
