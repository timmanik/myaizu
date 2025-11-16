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
    // Search endpoint returns data directly without wrapper
    return response as any as SearchResults;
  },

  /**
   * Search prompts only
   */
  searchPrompts: async (query: string, limit = 20): Promise<Prompt[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<{ prompts: Prompt[] }>(`/search/prompts?${params.toString()}`);
    // Search endpoint returns { prompts } directly
    return (response as any).prompts;
  },

  /**
   * Search collections only
   */
  searchCollections: async (query: string, limit = 20): Promise<SearchCollection[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<{ collections: SearchCollection[] }>(`/search/collections?${params.toString()}`);
    // Search endpoint returns { collections } directly
    return (response as any).collections;
  },

  /**
   * Search teams only
   */
  searchTeams: async (query: string, limit = 20): Promise<SearchTeam[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<{ teams: SearchTeam[] }>(`/search/teams?${params.toString()}`);
    // Search endpoint returns { teams } directly
    return (response as any).teams;
  },

  /**
   * Search users only
   */
  searchUsers: async (query: string, limit = 20): Promise<SearchUser[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<{ users: SearchUser[] }>(`/search/users?${params.toString()}`);
    // Search endpoint returns { users } directly
    return (response as any).users;
  },
};

