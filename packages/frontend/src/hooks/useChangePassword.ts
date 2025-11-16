import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../services/api/user';
import type { ChangePasswordDto } from '@aizu/shared';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => changePassword(data),
  });
}

