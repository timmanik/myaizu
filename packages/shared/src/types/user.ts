import { UserRole } from './roles';

/**
 * Base user interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation data (registration)
 */
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

/**
 * User update data
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

/**
 * User authentication response
 */
export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

