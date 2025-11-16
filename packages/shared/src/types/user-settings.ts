/**
 * User Profile Settings
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Public User Profile (viewable by others)
 */
export interface PublicUserProfile {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
  publicPromptsCount: number;
  publicCollectionsCount: number;
  teams: {
    id: string;
    name: string;
    role: string;
  }[];
}

