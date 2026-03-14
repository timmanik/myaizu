import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../services/api/user';
import type { UpdateProfileDto } from '@aizu/shared';
import { useAuth } from '../contexts/AuthContext';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => updateUserProfile(data),
    onSuccess: async () => {
      // Invalidate user profile queries
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      await refetchUser();
    },
  });
}
