import { PrismaClient, Invite, Role } from '@prisma/client';
import { NotFoundError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateInviteData {
  email: string;
  role: Role;
  createdBy: string;
  expiresInDays?: number;
}

/**
 * Create a new invite
 */
export async function createInvite(data: CreateInviteData): Promise<Invite> {
  const expiresInDays = data.expiresInDays || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const invite = await prisma.invite.create({
    data: {
      email: data.email,
      role: data.role,
      createdBy: data.createdBy,
      expiresAt,
    },
  });

  return invite;
}

/**
 * Validate an invite token
 */
export async function validateInvite(token: string): Promise<{
  valid: boolean;
  email?: string;
  role?: Role;
  error?: string;
}> {
  const invite = await prisma.invite.findUnique({
    where: { token },
  });

  if (!invite) {
    return { valid: false, error: 'Invalid invite token' };
  }

  if (invite.usedAt) {
    return { valid: false, error: 'Invite has already been used' };
  }

  if (new Date() > invite.expiresAt) {
    return { valid: false, error: 'Invite has expired' };
  }

  return {
    valid: true,
    email: invite.email,
    role: invite.role,
  };
}

/**
 * Get all invites (for admin)
 */
export async function getAllInvites(): Promise<Invite[]> {
  return prisma.invite.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Revoke an invite
 */
export async function revokeInvite(inviteId: string): Promise<void> {
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) {
    throw new NotFoundError('Invite not found');
  }

  await prisma.invite.delete({
    where: { id: inviteId },
  });
}

