import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../services/api/admin';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });
};

