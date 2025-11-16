import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllInvites,
  createInvite,
  revokeInvite,
  validateInvite,
  acceptInvite,
} from '../services/api/invites';
import type { CreateInviteDto } from '../services/api/invites';

/**
 * Get all invites (Super Admin only)
 */
export const useInvites = () => {
  return useQuery({
    queryKey: ['invites'],
    queryFn: getAllInvites,
  });
};

/**
 * Create a new invite
 */
export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInviteDto) => createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });
};

/**
 * Revoke an invite
 */
export const useRevokeInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });
};

/**
 * Validate an invite token
 */
export const useValidateInvite = (token: string) => {
  return useQuery({
    queryKey: ['invite', 'validate', token],
    queryFn: () => validateInvite(token),
    enabled: !!token,
  });
};

/**
 * Accept an invite
 */
export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: (data: { token: string; name: string; password: string }) =>
      acceptInvite(data),
  });
};

