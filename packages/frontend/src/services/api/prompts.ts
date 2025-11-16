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

interface PromptResponse {
  success: boolean;
  data: Prompt;
}

interface FavoriteResponse {
  success: boolean;
  data: {
    isFavorited: boolean;
  };
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

    const response = await apiClient.get<any>(
      `/prompts?${params.toString()}`
    );
    
    // Backend returns { success: true, data: Prompt[], pagination: {...} }
    // Transform to match PromptListResponse interface
    return {
      prompts: response.data || [],
      total: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 20,
    };
  },

  /**
   * Get a single prompt by ID
   */
  get: async (id: string): Promise<PromptResponse> => {
    const response = await apiClient.get<PromptResponse>(`/prompts/${id}`);
    // Backend returns { success: true, data: prompt }, so return the whole response
    return response as PromptResponse;
  },

  /**
   * Create a new prompt
   */
  create: async (data: CreatePromptDto): Promise<PromptResponse> => {
    const response = await apiClient.post<PromptResponse>('/prompts', data);
    return response as PromptResponse;
  },

  /**
   * Update a prompt
   */
  update: async (id: string, data: UpdatePromptDto): Promise<PromptResponse> => {
    const response = await apiClient.put<PromptResponse>(`/prompts/${id}`, data);
    return response as PromptResponse;
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
  toggleFavorite: async (id: string): Promise<FavoriteResponse> => {
    const response = await apiClient.post<FavoriteResponse>(
      `/prompts/${id}/favorite`
    );
    return response as FavoriteResponse;
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
  fork: async (id: string): Promise<PromptResponse> => {
    const response = await apiClient.post<PromptResponse>(`/prompts/${id}/fork`);
    return response as PromptResponse;
  },
};

