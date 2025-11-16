import { useQuery } from '@tanstack/react-query';
import { getUserPublicPrompts } from '../services/api/user';

export function useUserPublicPrompts(userId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['users', userId, 'prompts', page, limit],
    queryFn: () => getUserPublicPrompts(userId, page, limit),
    enabled: !!userId,
  });
}

