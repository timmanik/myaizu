import { apiClient } from './client';
import type {
  Team,
  TeamWithMembers,
  TeamFilters,
  TeamPromptsFilters,
  AddTeamMemberDto,
  UpdateTeamMemberRoleDto,
  Prompt,
} from '@aizu/shared';

export const teamsApi = {
  /**
   * Get all teams
   */
  getTeams: async (filters?: TeamFilters): Promise<Team[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.memberUserId) params.append('memberUserId', filters.memberUserId);

      const response = await apiClient.get<Team[]>(`/teams?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      return [];
    }
  },

  /**
   * Get a single team by ID
   */
  getTeamById: async (id: string): Promise<TeamWithMembers> => {
    const response = await apiClient.get<TeamWithMembers>(`/teams/${id}`);
    return response.data!;
  },

  /**
   * Get team prompts
   */
  getTeamPrompts: async (id: string, filters?: TeamPromptsFilters): Promise<Prompt[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.sortField) params.append('sortField', filters.sortField);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.viewAsPublic) params.append('viewAsPublic', 'true');

    const response = await apiClient.get<Prompt[]>(
      `/teams/${id}/prompts?${params.toString()}`
    );
    return response.data || [];
  },

  /**
   * Add a member to a team
   */
  addTeamMember: async (teamId: string, data: AddTeamMemberDto): Promise<void> => {
    await apiClient.post(`/teams/${teamId}/members`, data);
  },

  /**
   * Remove a member from a team
   */
  removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  /**
   * Update a team member's role
   */
  updateTeamMemberRole: async (
    teamId: string,
    userId: string,
    data: UpdateTeamMemberRoleDto
  ): Promise<void> => {
    await apiClient.put(`/teams/${teamId}/members/${userId}/role`, data);
  },
};
