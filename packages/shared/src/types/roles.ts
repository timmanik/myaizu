/**
 * User role enumeration
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TEAM_ADMIN = 'TEAM_ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Type-safe role type
 */
export type Role = UserRole;

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.TEAM_ADMIN]: 2,
  [UserRole.MEMBER]: 1,
};

/**
 * Check if a role has at least the required permission level
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

