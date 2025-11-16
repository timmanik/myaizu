import { useQuery } from '@tanstack/react-query';
import { getPinnedPrompts } from '@/services/api/user';

export const useUserPinnedPrompts = () => {
  return useQuery({
    queryKey: ['user-pinned-prompts'],
    queryFn: () => getPinnedPrompts(),
  });
};

