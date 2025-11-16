import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganization, updateOrganization } from '../services/api/organization';
import type { UpdateOrganizationDto } from '@aizu/shared';

export const useOrganization = () => {
  return useQuery({
    queryKey: ['organization'],
    queryFn: getOrganization,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationDto) => updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
};

