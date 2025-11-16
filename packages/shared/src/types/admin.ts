/**
 * Admin Types and DTOs
 */

import { Role } from './roles';
import { Team, TeamMember } from './team';
import { User } from './user';

/**
 * TEAM MANAGEMENT
 */

// Note: CreateTeamDto and UpdateTeamDto are already exported from ./team

export interface TeamWithDetails extends Team {
  members: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  })[];
  _count: {
    members: number;
    prompts: number;
    collections: number;
  };
}

export interface AssignTeamAdminDto {
  userId: string;
}

/**
 * USER MANAGEMENT
 */

export interface UserWithStats {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    prompts: number;
    collections: number;
    teamMemberships: number;
  };
}

export interface UpdateUserRoleDto {
  role: Role;
}

export interface UserFilters {
  search?: string;
  role?: Role;
}

/**
 * ADMIN STATISTICS
 */

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalTeams: number;
    totalPrompts: number;
    totalCollections: number;
    activeInvites: number;
  };
  usersByRole: {
    role: Role;
    count: number;
  }[];
  promptsByVisibility: {
    visibility: string;
    count: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
  }[];
}

/**
 * ORGANIZATION
 */

export interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateOrganizationDto {
  name?: string;
  logoUrl?: string | null;
}

/**
 * INVITE MANAGEMENT (extended from existing types)
 */

export interface InviteWithCreator {
  id: string;
  token: string;
  email: string;
  role: Role;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

