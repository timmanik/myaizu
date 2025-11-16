import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../services/api/user';
import type { UpdateProfileDto } from '@aizu/shared';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => updateUserProfile(data),
    onSuccess: () => {
      // Invalidate user profile queries
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

