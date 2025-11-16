import { PrismaClient, Role } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { hashPassword, comparePassword } from '../utils/password';

const prisma = new PrismaClient();

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user profile (name, email, avatarUrl)
 */
export async function updateProfile(userId: string, data: UpdateProfileData) {
  // If email is being changed, check if it's already taken
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestError('Email is already taken');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
      ...(data.role && { role: data.role as Role }),
    },
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

/**
 * Change user password
 */
export async function changePassword(userId: string, data: ChangePasswordData) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(data.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Hash and update new password
  const hashedPassword = await hashPassword(data.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

/**
 * Get user's public profile (for viewing by others)
 */
export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      // Count public prompts and collections
      _count: {
        select: {
          prompts: {
            where: {
              visibility: 'PUBLIC',
            },
          },
          collections: {
            where: {
              visibility: 'PUBLIC',
            },
          },
        },
      },
      // Get team memberships
      teamMemberships: {
        select: {
          role: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    publicPromptsCount: user._count.prompts,
    publicCollectionsCount: user._count.collections,
    teams: user.teamMemberships.map((membership) => ({
      id: membership.team.id,
      name: membership.team.name,
      role: membership.role,
    })),
  };
}

/**
 * Get user's public prompts (for viewing by others)
 */
export async function getUserPublicPrompts(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [prompts, total] = await Promise.all([
    prisma.prompt.findMany({
      where: {
        authorId: userId,
        visibility: 'PUBLIC',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.prompt.count({
      where: {
        authorId: userId,
        visibility: 'PUBLIC',
      },
    }),
  ]);

  return {
    prompts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user's public collections (for viewing by others)
 */
export async function getUserPublicCollections(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [collections, total] = await Promise.all([
    prisma.collection.findMany({
      where: {
        ownerId: userId,
        visibility: 'PUBLIC',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            collectionPrompts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.collection.count({
      where: {
        ownerId: userId,
        visibility: 'PUBLIC',
      },
    }),
  ]);

  return {
    collections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user's pinned prompts with full prompt data
 */
export async function getUserPinnedPrompts(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinnedPrompts: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.pinnedPrompts || user.pinnedPrompts.length === 0) {
    return [];
  }

  // Fetch full prompt data for pinned prompts
  // Filter out prompts the user no longer has access to
  const prompts = await prisma.prompt.findMany({
    where: {
      id: { in: user.pinnedPrompts },
      OR: [
        { visibility: 'PUBLIC' },
        { authorId: userId },
        {
          visibility: 'TEAM',
          team: {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Return prompts in the order they were pinned
  const orderedPrompts = user.pinnedPrompts
    .map((pinnedId) => prompts.find((p) => p.id === pinnedId))
    .filter((p) => p !== undefined);

  return orderedPrompts;
}

/**
 * Check if user can access a prompt
 */
async function canAccessPrompt(userId: string, promptId: string): Promise<boolean> {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    include: {
      team: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!prompt) {
    return false;
  }

  // Public prompts - anyone can access
  if (prompt.visibility === 'PUBLIC') {
    return true;
  }

  // Own prompts - always accessible
  if (prompt.authorId === userId) {
    return true;
  }

  // Team prompts - check team membership
  if (prompt.visibility === 'TEAM' && prompt.team) {
    return prompt.team.members.length > 0;
  }

  // Private prompts of other users - no access
  return false;
}

/**
 * Pin a prompt to user's home page
 */
export async function pinPrompt(userId: string, promptId: string) {
  // Check if prompt exists and user has access
  const hasAccess = await canAccessPrompt(userId, promptId);
  if (!hasAccess) {
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) {
      throw new NotFoundError('Prompt not found');
    }
    throw new BadRequestError('You do not have access to this prompt');
  }

  // Get user's current pinned prompts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinnedPrompts: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const currentPins = user.pinnedPrompts || [];

  // Check if already pinned
  if (currentPins.includes(promptId)) {
    throw new BadRequestError('Prompt is already pinned');
  }

  // Check limit (max 3)
  if (currentPins.length >= 3) {
    throw new BadRequestError('You can only pin up to 3 prompts. Unpin one first.');
  }

  // Add to pinned prompts
  await prisma.user.update({
    where: { id: userId },
    data: {
      pinnedPrompts: [...currentPins, promptId],
    },
  });

  return { success: true };
}

/**
 * Unpin a prompt from user's home page
 */
export async function unpinPrompt(userId: string, promptId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinnedPrompts: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const currentPins = user.pinnedPrompts || [];

  // Check if prompt is pinned
  if (!currentPins.includes(promptId)) {
    throw new NotFoundError('Prompt is not pinned');
  }

  // Remove from pinned prompts
  await prisma.user.update({
    where: { id: userId },
    data: {
      pinnedPrompts: currentPins.filter((id) => id !== promptId),
    },
  });

  return { success: true };
}

