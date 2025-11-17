import { PrismaClient, Role, TeamMemberRole as PrismaTeamMemberRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * TEAM MANAGEMENT (Super Admin only)
 */

/**
 * Create a new team
 */
export const createTeam = async (data: {
  name: string;
  description?: string;
  createdBy: string;
}) => {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
    },
    include: {
      _count: {
        select: {
          members: true,
          prompts: true,
          collections: true,
        },
      },
    },
  });

  return team;
};

/**
 * Get all teams (Super Admin only)
 */
export const getAllTeams = async (filters: { search?: string } = {}) => {
  const { search } = filters;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const teams = await prisma.team.findMany({
    where,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          prompts: true,
          collections: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return teams;
};

/**
 * Update a team
 */
export const updateTeam = async (
  teamId: string,
  data: {
    name?: string;
    description?: string;
  }
) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          prompts: true,
          collections: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      _count: {
        select: {
          members: true,
          prompts: true,
          collections: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Delete team members
  await prisma.teamMember.deleteMany({
    where: { teamId },
  });

  // Update prompts to remove team reference
  await prisma.prompt.updateMany({
    where: { teamId },
    data: { teamId: null, visibility: 'PRIVATE' },
  });

  // Update collections to remove team reference
  await prisma.collection.updateMany({
    where: { teamId },
    data: { teamId: null, visibility: 'PRIVATE' },
  });

  // Delete the team
  await prisma.team.delete({
    where: { id: teamId },
  });

  return { success: true };
};

/**
 * Assign a user as Team Admin (Super Admin only)
 */
export const assignTeamAdmin = async (teamId: string, userId: string) => {
  // Verify team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is already a member
  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (existingMembership) {
    // Update to admin role
    const updated = await prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
      data: {
        role: PrismaTeamMemberRole.ADMIN,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
    return updated;
  } else {
    // Add as new admin member
    const membership = await prisma.teamMember.create({
      data: {
        userId,
        teamId,
        role: PrismaTeamMemberRole.ADMIN,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
    return membership;
  }
};

/**
 * Remove team admin (demote to member or remove)
 */
export const removeTeamAdmin = async (teamId: string, userId: string) => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new Error('User is not a member of this team');
  }

  if (membership.role !== PrismaTeamMemberRole.ADMIN) {
    throw new Error('User is not an admin of this team');
  }

  // Check if this is the last admin
  const adminCount = await prisma.teamMember.count({
    where: {
      teamId,
      role: PrismaTeamMemberRole.ADMIN,
    },
  });

  if (adminCount <= 1) {
    throw new Error('Cannot remove the last admin from the team');
  }

  // Demote to member
  const updated = await prisma.teamMember.update({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
    data: {
      role: PrismaTeamMemberRole.MEMBER,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return updated;
};

/**
 * USER MANAGEMENT (Super Admin only)
 */

/**
 * Get all users
 */
export const getAllUsers = async (filters: { search?: string; role?: Role } = {}) => {
  const { search, role } = filters;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          prompts: true,
          collections: true,
          teamMemberships: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, newRole: Role) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Prevent downgrading the last Super Admin
  if (user.role === Role.SUPER_ADMIN && newRole !== Role.SUPER_ADMIN) {
    const superAdminCount = await prisma.user.count({
      where: { role: Role.SUPER_ADMIN },
    });

    if (superAdminCount <= 1) {
      throw new Error('Cannot downgrade the last Super Admin');
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      updatedAt: new Date(),
    },
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

  return updated;
};

/**
 * Deactivate/delete a user
 */
export const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Prevent deleting the last Super Admin
  if (user.role === Role.SUPER_ADMIN) {
    const superAdminCount = await prisma.user.count({
      where: { role: Role.SUPER_ADMIN },
    });

    if (superAdminCount <= 1) {
      throw new Error('Cannot delete the last Super Admin');
    }
  }

  // Delete user's team memberships
  await prisma.teamMember.deleteMany({
    where: { userId },
  });

  // Delete user's favorites
  await prisma.favorite.deleteMany({
    where: { userId },
  });

  // Delete the user (cascading deletes will handle prompts and collections)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
};

/**
 * STATISTICS (for admin dashboard)
 */

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async () => {
  const [
    totalUsers,
    totalTeams,
    totalPrompts,
    totalCollections,
    activeInvites,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.prompt.count(),
    prisma.collection.count(),
    prisma.invite.count({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  // Get users by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  // Get prompts by visibility
  const promptsByVisibility = await prisma.prompt.groupBy({
    by: ['visibility'],
    _count: true,
  });

  return {
    overview: {
      totalUsers,
      totalTeams,
      totalPrompts,
      totalCollections,
      activeInvites,
    },
    usersByRole: usersByRole.map((group) => ({
      role: group.role,
      count: group._count,
    })),
    promptsByVisibility: promptsByVisibility.map((group) => ({
      visibility: group.visibility,
      count: group._count,
    })),
    recentUsers,
  };
};
