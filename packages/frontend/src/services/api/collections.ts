import { apiClient } from './client';
import type {
  Collection,
  CollectionWithPrompts,
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilters,
} from '@aizu/shared';

export const collectionsApi = {
  /**
   * Get all collections
   */
  getCollections: async (filters?: CollectionFilters): Promise<Collection[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.ownerId) params.append('ownerId', filters.ownerId);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.sortField) params.append('sortField', filters.sortField);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/collections?${params.toString()}`);
    // Backend returns { success: true, data: collections }, so access response.data
    return response.data || [];
  },

  /**
   * Get a single collection by ID
   */
  getCollectionById: async (id: string): Promise<CollectionWithPrompts> => {
    const response = await apiClient.get(`/collections/${id}`);
    return response.data;
  },

  /**
   * Create a new collection
   */
  createCollection: async (data: CreateCollectionDto): Promise<Collection> => {
    const response = await apiClient.post('/collections', data);
    return response.data;
  },

  /**
   * Update a collection
   */
  updateCollection: async (id: string, data: UpdateCollectionDto): Promise<Collection> => {
    const response = await apiClient.put(`/collections/${id}`, data);
    return response.data;
  },

  /**
   * Delete a collection
   */
  deleteCollection: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/${id}`);
  },

  /**
   * Add a prompt to a collection
   */
  addPromptToCollection: async (collectionId: string, promptId: string): Promise<void> => {
    await apiClient.post(`/collections/${collectionId}/prompts`, { promptId });
  },

  /**
   * Remove a prompt from a collection
   */
  removePromptFromCollection: async (collectionId: string, promptId: string): Promise<void> => {
    await apiClient.delete(`/collections/${collectionId}/prompts/${promptId}`);
  },
};

