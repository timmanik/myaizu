import { PrismaClient, TeamMemberRole as PrismaTeamMemberRole } from '@prisma/client';
import {
  TeamMemberRole,
  TeamFilters,
  TeamPromptsFilters,
} from '@aizu/shared';

const prisma = new PrismaClient();

/**
 * Get all teams (publicly viewable)
 */
export const getTeams = async (userId: string, filters: TeamFilters = {}) => {
  const { search, memberUserId } = filters;

  const where: any = {};

  // If memberUserId is specified, filter by that member
  if (memberUserId) {
    where.members = {
      some: { userId: memberUserId },
    };
  }

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
          collections: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Calculate prompt count for each team based on viewer's membership
  const teamsWithCounts = await Promise.all(
    teams.map(async (team) => {
      // Check if the current user is a member of this team
      const isMember = await isTeamMember(team.id, userId);
      
      // Build the count query based on membership
      const promptCount = await prisma.prompt.count({
        where: isMember
          ? {
              // Member view: TEAM + PUBLIC prompts
              OR: [
                {
                  visibility: 'TEAM',
                  teamId: team.id,
                },
                {
                  visibility: 'PUBLIC',
                  author: {
                    teamMemberships: {
                      some: { teamId: team.id },
                    },
                  },
                },
              ],
            }
          : {
              // Public view: only PUBLIC prompts from team members
              visibility: 'PUBLIC',
              author: {
                teamMemberships: {
                  some: { teamId: team.id },
                },
              },
            },
      });

      return {
        ...team,
        _count: {
          ...team._count,
          prompts: promptCount,
        },
      };
    })
  );

  return teamsWithCounts;
};

/**
 * Check if a user is a member of a team
 */
export const isTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });
  return !!membership;
};

/**
 * Get a single team by ID (publicly viewable with viewer-specific counts)
 */
export const getTeamById = async (teamId: string, userId: string) => {
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
          members: true,
          collections: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // Check if viewer is a member
  const isMember = await isTeamMember(teamId, userId);

  // Calculate prompt count based on viewer's membership
  const promptCount = await prisma.prompt.count({
    where: isMember
      ? {
          // Member view: TEAM + PUBLIC prompts
          OR: [
            {
              visibility: 'TEAM',
              teamId: teamId,
            },
            {
              visibility: 'PUBLIC',
              author: {
                teamMemberships: {
                  some: { teamId: teamId },
                },
              },
            },
          ],
        }
      : {
          // Public view: only PUBLIC prompts from team members
          visibility: 'PUBLIC',
          author: {
            teamMemberships: {
              some: { teamId: teamId },
            },
          },
        },
  });

  return {
    ...team,
    _count: {
      ...team._count,
      prompts: promptCount,
    },
  };
};

/**
 * Get prompts for a specific team
 * Returns PUBLIC and TEAM prompts from team members for members
 * Returns only PUBLIC prompts from team members for non-members or when viewAsPublic is true
 */
export const getTeamPrompts = async (
  teamId: string,
  userId: string,
  filters: TeamPromptsFilters = {}
) => {
  // Check if user is a member
  const isMember = await isTeamMember(teamId, userId);
  
  // Determine view mode: public view if not a member OR if explicitly requested
  const viewAsPublic = filters.viewAsPublic || !isMember;

  const { search, platform, tags, sortField = 'createdAt', sortOrder = 'desc' } = filters;

  // Build visibility conditions based on view mode
  const visibilityConditions: any[] = [];
  
  if (viewAsPublic) {
    // Public view: only PUBLIC prompts from team members
    visibilityConditions.push({
      visibility: 'PUBLIC',
      author: {
        teamMemberships: {
          some: { teamId },
        },
      },
    });
  } else {
    // Member view: PUBLIC and TEAM prompts from team members
    visibilityConditions.push(
      {
        visibility: 'PUBLIC',
        author: {
          teamMemberships: {
            some: { teamId },
          },
        },
      },
      {
        visibility: 'TEAM',
        teamId,
      }
    );
  }

  const where: any = {
    OR: visibilityConditions,
  };

  // Add search filter
  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  // Add platform filter
  if (platform) {
    if (!where.AND) where.AND = [];
    where.AND.push({ platform });
  }

  // Add tags filter
  if (tags && tags.length > 0) {
    if (!where.AND) where.AND = [];
    where.AND.push({ tags: { hasSome: tags } });
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
      favorites: {
        where: { userId },
        select: { userId: true },
      },
    },
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  return prompts.map(p => mapPromptToShared(p, userId));
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
 * Helper function to transform Prisma prompt to shared Prompt type
 */
const mapPromptToShared = (prompt: any, userId: string): any => {
  return {
    id: prompt.id,
    title: prompt.title,
    content: prompt.content,
    description: prompt.description,
    variables: prompt.variables,
    platform: prompt.platform,
    visibility: prompt.visibility,
    tags: prompt.tags,
    promptType: prompt.promptType,
    additionalInstructions: prompt.additionalInstructions,
    config: prompt.config,
    authorId: prompt.authorId,
    authorName: prompt.author?.name,
    teamId: prompt.teamId,
    copyCount: prompt.copyCount,
    favoriteCount: prompt.favoriteCount,
    isFavorited: prompt.favorites?.some((f: any) => f.userId === userId) || false,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
  };
};

