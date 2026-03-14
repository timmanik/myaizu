import { apiClient } from './client';
import type { Prompt } from '@aizu/shared';

export interface SearchCollection {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  ownerId: string;
  ownerName?: string;
  teamId: string | null;
  promptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchTeam {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  promptCount: number;
  userRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface SearchResults {
  prompts: Prompt[];
  collections: SearchCollection[];
  teams: SearchTeam[];
  users: SearchUser[];
}

export const searchApi = {
  /**
   * Search across all entity types
   */
  searchAll: async (query: string, limit = 10): Promise<SearchResults> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await apiClient.get<SearchResults>(`/search?${params.toString()}`);
    if (!response.data) {
      throw new Error('Failed to load search results');
    }
    return response.data;
  },

  /**
   * Search prompts only
   */
  searchPrompts: async (query: string, limit = 20): Promise<Prompt[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ prompts: Prompt[] }>(
      `/search/prompts?${params.toString()}`
    );
    if (!response.data?.prompts) {
      throw new Error('Failed to load prompt search results');
    }
    return response.data.prompts;
  },

  /**
   * Search collections only
   */
  searchCollections: async (query: string, limit = 20): Promise<SearchCollection[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ collections: SearchCollection[] }>(
      `/search/collections?${params.toString()}`
    );
    if (!response.data?.collections) {
      throw new Error('Failed to load collection search results');
    }
    return response.data.collections;
  },

  /**
   * Search teams only
   */
  searchTeams: async (query: string, limit = 20): Promise<SearchTeam[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ teams: SearchTeam[] }>(
      `/search/teams?${params.toString()}`
    );
    if (!response.data?.teams) {
      throw new Error('Failed to load team search results');
    }
    return response.data.teams;
  },

  /**
   * Search users only
   */
  searchUsers: async (query: string, limit = 20): Promise<SearchUser[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ users: SearchUser[] }>(
      `/search/users?${params.toString()}`
    );
    if (!response.data?.users) {
      throw new Error('Failed to load user search results');
    }
    return response.data.users;
  },
};
