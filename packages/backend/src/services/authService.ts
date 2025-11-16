import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  inviteToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

/**
 * Login user with email and password
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Register new user via invite token
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  // Find and validate invite
  const invite = await prisma.invite.findUnique({
    where: { token: data.inviteToken },
  });

  if (!invite) {
    throw new BadRequestError('Invalid invite token');
  }

  if (invite.usedAt) {
    throw new BadRequestError('Invite has already been used');
  }

  if (new Date() > invite.expiresAt) {
    throw new BadRequestError('Invite has expired');
  }

  if (invite.email !== data.email) {
    throw new BadRequestError('Email does not match invite');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  // Create user
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: invite.role,
    },
  });

  // Mark invite as used
  await prisma.invite.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Get current user by ID
 */
export async function getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

