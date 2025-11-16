import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../services/api/user';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

