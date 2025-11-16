// Team-related types

export enum TeamMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  pinnedPrompts: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Optional populated relations
  members?: TeamMember[];
  _count?: {
    members: number;
    prompts: number;
    collections: number;
  };
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamMemberRole;
  createdAt: Date;
  
  // Optional populated relations
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

// DTOs for API requests
export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface AddTeamMemberDto {
  userId: string;
  role?: TeamMemberRole;
}

export interface UpdateTeamMemberRoleDto {
  role: TeamMemberRole;
}

export interface PinPromptDto {
  promptId: string;
}

// Filter and query types
export interface TeamFilters {
  search?: string;
  memberUserId?: string;
}

export interface TeamPromptsFilters {
  search?: string;
  platform?: string;
  tags?: string[];
  sortField?: 'createdAt' | 'updatedAt' | 'title' | 'favoriteCount';
  sortOrder?: 'asc' | 'desc';
}

