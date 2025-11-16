import { UserRole } from '../types/roles';

/**
 * Role display names
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.TEAM_ADMIN]: 'Team Admin',
  [UserRole.MEMBER]: 'Member',
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Full system access. Can manage teams, users, and organization settings.',
  [UserRole.TEAM_ADMIN]: 'Can manage their assigned teams and team members.',
  [UserRole.MEMBER]: 'Standard user access. Can create and manage personal prompts.',
};

/**
 * All available roles
 */
export const ALL_ROLES = Object.values(UserRole);

