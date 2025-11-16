import { PrismaClient, TeamMemberRole as PrismaTeamMemberRole } from '@prisma/client';
import {
  TeamMemberRole,
  TeamFilters,
  TeamPromptsFilters,
} from '@aizu/shared';

const prisma = new PrismaClient();

/**
 * Get all teams the user has access to
 */
export const getTeams = async (userId: string, filters: TeamFilters = {}) => {
  const { search, memberUserId } = filters;

  const where: any = {
    members: {
      some: { userId: memberUserId || userId },
    },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const teams = await prisma.team.findMany({
    where,
    include: {
      _count: {
        select: {
          members: true,
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
 * Get a single team by ID
 */
export const getTeamById = async (teamId: string, userId: string) => {
  // Verify user is a member
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this team');
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
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
        orderBy: {
          createdAt: 'asc',
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

  if (!team) {
    throw new Error('Team not found');
  }

  return team;
};

/**
 * Get prompts for a specific team
 */
export const getTeamPrompts = async (
  teamId: string,
  userId: string,
  filters: TeamPromptsFilters = {}
) => {
  // Verify user is a member
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this team');
  }

  const { search, platform, tags, sortField = 'createdAt', sortOrder = 'desc' } = filters;

  const where: any = {
    teamId,
    visibility: 'TEAM',
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (platform) {
    where.platform = platform;
  }

  if (tags && tags.length > 0) {
    where.tags = {
      hasSome: tags,
    };
  }

  const prompts = await prisma.prompt.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  return prompts;
};

/**
 * Get user's role in a team
 */
export const getUserTeamRole = async (
  teamId: string,
  userId: string
): Promise<PrismaTeamMemberRole | null> => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  return membership ? membership.role : null;
};

/**
 * Add a member to a team (Team Admin only)
 */
export const addTeamMember = async (
  teamId: string,
  adminUserId: string,
  newMemberUserId: string,
  role: TeamMemberRole = TeamMemberRole.MEMBER
) => {
  // Verify admin has permission
  const adminRole = await getUserTeamRole(teamId, adminUserId);
  if (adminRole !== PrismaTeamMemberRole.ADMIN) {
    throw new Error('Only team admins can add members');
  }

  // Check if user is already a member
  const existing = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: newMemberUserId,
        teamId,
      },
    },
  });

  if (existing) {
    throw new Error('User is already a member of this team');
  }

  // Verify new member exists
  const user = await prisma.user.findUnique({
    where: { id: newMemberUserId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const membership = await prisma.teamMember.create({
    data: {
      userId: newMemberUserId,
      teamId,
      role,
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
};

/**
 * Remove a member from a team (Team Admin only)
 */
export const removeTeamMember = async (
  teamId: string,
  adminUserId: string,
  memberUserId: string
) => {
  // Verify admin has permission
  const adminRole = await getUserTeamRole(teamId, adminUserId);
  if (adminRole !== PrismaTeamMemberRole.ADMIN) {
    throw new Error('Only team admins can remove members');
  }

  // Check if member exists
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: memberUserId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new Error('User is not a member of this team');
  }

  // Don't allow removing the last admin
  if (membership.role === PrismaTeamMemberRole.ADMIN) {
    const adminCount = await prisma.teamMember.count({
      where: {
        teamId,
        role: TeamMemberRole.ADMIN,
      },
    });

    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin from the team');
    }
  }

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId: memberUserId,
        teamId,
      },
    },
  });

  return { success: true };
};

/**
 * Update a team member's role (Team Admin only)
 */
export const updateTeamMemberRole = async (
  teamId: string,
  adminUserId: string,
  memberUserId: string,
  newRole: TeamMemberRole
) => {
  // Verify admin has permission
  const adminRole = await getUserTeamRole(teamId, adminUserId);
  if (adminRole !== PrismaTeamMemberRole.ADMIN) {
    throw new Error('Only team admins can update member roles');
  }

  // Check if member exists
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: memberUserId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new Error('User is not a member of this team');
  }

  // If demoting from admin, check we're not removing the last admin
  if (membership.role === PrismaTeamMemberRole.ADMIN && newRole !== PrismaTeamMemberRole.ADMIN) {
    const adminCount = await prisma.teamMember.count({
      where: {
        teamId,
        role: TeamMemberRole.ADMIN,
      },
    });

    if (adminCount <= 1) {
      throw new Error('Cannot demote the last admin from the team');
    }
  }

  const updated = await prisma.teamMember.update({
    where: {
      userId_teamId: {
        userId: memberUserId,
        teamId,
      },
    },
    data: {
      role: newRole,
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
 * Pin a prompt to a team (Team Admin only)
 */
export const pinPrompt = async (teamId: string, adminUserId: string, promptId: string) => {
  // Verify admin has permission
  const adminRole = await getUserTeamRole(teamId, adminUserId);
  if (adminRole !== PrismaTeamMemberRole.ADMIN) {
    throw new Error('Only team admins can pin prompts');
  }

  // Verify prompt exists and belongs to team
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    throw new Error('Prompt not found');
  }

  if (prompt.teamId !== teamId) {
    throw new Error('Prompt does not belong to this team');
  }

  // Get team and update pinned prompts
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Check if already pinned
  if (team.pinnedPrompts.includes(promptId)) {
    throw new Error('Prompt is already pinned');
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      pinnedPrompts: [...team.pinnedPrompts, promptId],
    },
  });

  return updated;
};

/**
 * Unpin a prompt from a team (Team Admin only)
 */
export const unpinPrompt = async (teamId: string, adminUserId: string, promptId: string) => {
  // Verify admin has permission
  const adminRole = await getUserTeamRole(teamId, adminUserId);
  if (adminRole !== PrismaTeamMemberRole.ADMIN) {
    throw new Error('Only team admins can unpin prompts');
  }

  // Get team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Check if pinned
  if (!team.pinnedPrompts.includes(promptId)) {
    throw new Error('Prompt is not pinned');
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      pinnedPrompts: team.pinnedPrompts.filter((id) => id !== promptId),
    },
  });

  return updated;
};

/**
 * Get pinned prompts for a team
 */
export const getPinnedPrompts = async (teamId: string, userId: string) => {
  // Verify user is a member
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this team');
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  if (team.pinnedPrompts.length === 0) {
    return [];
  }

  const prompts = await prisma.prompt.findMany({
    where: {
      id: { in: team.pinnedPrompts },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Maintain the order from pinnedPrompts array
  const orderedPrompts = team.pinnedPrompts
    .map((id) => prompts.find((p) => p.id === id))
    .filter((p) => p !== undefined);

  return orderedPrompts;
};

