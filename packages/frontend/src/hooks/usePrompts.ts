import { useQuery } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/prompts';
import type { PromptFilters, PromptSort } from '@aizu/shared';

export const usePrompts = (
  filters?: PromptFilters,
  sort?: PromptSort,
  page = 1,
  limit = 20
) => {
  // If filters includes authorId key, only fetch if it has a value
  // This prevents fetching when waiting for user to load
  const hasAuthorIdFilter = filters && 'authorId' in filters;
  const isEnabled = hasAuthorIdFilter ? !!filters.authorId : true;
  
  return useQuery({
    queryKey: ['prompts', filters, sort, page, limit],
    queryFn: () => promptsApi.list(filters, sort, page, limit),
    enabled: isEnabled,
  });
};

