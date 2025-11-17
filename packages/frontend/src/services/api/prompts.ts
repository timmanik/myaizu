import { apiClient } from './client';
import type {
  Prompt,
  CreatePromptDto,
  UpdatePromptDto,
  PromptFilters,
  PromptSort,
} from '@aizu/shared';

interface PromptListResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  limit: number;
}

export const promptsApi = {
  /**
   * List prompts with filters and pagination
   */
  list: async (
    filters?: PromptFilters,
    sort?: PromptSort,
    page = 1,
    limit = 20
  ): Promise<PromptListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isFavorited) params.append('isFavorited', 'true');
    
    if (sort) {
      params.append('sortField', sort.field);
      params.append('sortOrder', sort.order);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get<Prompt[]>(
      `/prompts?${params.toString()}`
    );
    
    return {
      prompts: response.data || [],
      total: response.pagination?.total || response.data?.length || 0,
      page: response.pagination?.page || page,
      limit: response.pagination?.limit || limit,
    };
  },

  /**
   * Get a single prompt by ID
   */
  get: async (id: string) => {
    return apiClient.get<Prompt>(`/prompts/${id}`);
  },

  /**
   * Create a new prompt
   */
  create: async (data: CreatePromptDto) => {
    return apiClient.post<Prompt>('/prompts', data);
  },

  /**
   * Update a prompt
   */
  update: async (id: string, data: UpdatePromptDto) => {
    return apiClient.put<Prompt>(`/prompts/${id}`, data);
  },

  /**
   * Delete a prompt
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/prompts/${id}`);
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (id: string) => {
    return apiClient.post<{ isFavorited: boolean }>(
      `/prompts/${id}/favorite`
    );
  },

  /**
   * Increment copy count
   */
  incrementCopy: async (id: string): Promise<void> => {
    await apiClient.post(`/prompts/${id}/copy`);
  },

  /**
   * Fork/remix a prompt
   */
  fork: async (id: string) => {
    return apiClient.post<Prompt>(`/prompts/${id}/fork`);
  },
};
