import { PrismaClient, TeamMemberRole } from '@prisma/client';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilters,
  CollectionVisibility,
} from '@aizu/shared';
import { getUserTeamRole } from './teamService';

const prisma = new PrismaClient();

/**
 * Get all collections accessible to a user
 */
export const getCollections = async (userId: string, filters: CollectionFilters = {}) => {
  const {
    search,
    visibility,
    ownerId,
    teamId,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  // Build where clause
  const where: any = {
    OR: [
      { ownerId: userId }, // User owns the collection
      { visibility: 'PUBLIC' }, // Public collections
      {
        AND: [
          { visibility: 'TEAM' },
          {
            team: {
              members: {
                some: { userId },
              },
            },
          },
        ],
      }, // Team collections where user is a member
    ],
  };

  // Apply additional filters
  if (search) {
    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (visibility) {
    where.AND = where.AND || [];
    where.AND.push({ visibility });
  }

  if (ownerId) {
    where.AND = where.AND || [];
    where.AND.push({ ownerId });
  }

  if (teamId) {
    where.AND = where.AND || [];
    where.AND.push({ teamId });
  }

  const collections = await prisma.collection.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
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
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  return collections;
};

/**
 * Get a single collection by ID
 */
export const getCollectionById = async (collectionId: string, userId: string) => {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      collectionPrompts: {
        include: {
          prompt: {
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
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  // Check access permissions
  const hasAccess =
    collection.ownerId === userId ||
    collection.visibility === 'PUBLIC' ||
    (collection.visibility === 'TEAM' &&
      collection.team &&
      (await isUserInTeam(userId, collection.teamId!)));

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  return collection;
};

/**
 * Create a new collection
 */
export const createCollection = async (userId: string, data: CreateCollectionDto) => {
  const { name, description, visibility = CollectionVisibility.PRIVATE, teamId } = data;

  // If teamId is provided, validate team admin permission and visibility
  if (teamId) {
    // Check if user is a team admin
    const userRole = await getUserTeamRole(teamId, userId);
    if (userRole !== TeamMemberRole.ADMIN) {
      throw new Error('Only team admins can create team collections');
    }

    // Ensure team collections cannot be PRIVATE
    if (visibility === CollectionVisibility.PRIVATE) {
      throw new Error('Team collections cannot be private. Choose TEAM or PUBLIC visibility.');
    }
  }

  const collection = await prisma.collection.create({
    data: {
      name,
      description,
      visibility,
      ownerId: userId,
      teamId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
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
  });

  return collection;
};

/**
 * Update a collection
 */
export const updateCollection = async (
  collectionId: string,
  userId: string,
  data: UpdateCollectionDto
) => {
  // Get existing collection
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  // Check if user can modify this collection
  const canModify = await canUserModifyCollection(collection, userId);
  if (!canModify) {
    throw new Error('You do not have permission to update this collection');
  }

  // If setting teamId, validate team admin permission and visibility
  if (data.teamId) {
    const userRole = await getUserTeamRole(data.teamId, userId);
    if (userRole !== TeamMemberRole.ADMIN) {
      throw new Error('Only team admins can create team collections');
    }

    // Ensure team collections cannot be PRIVATE
    if (data.visibility === CollectionVisibility.PRIVATE) {
      throw new Error('Team collections cannot be private. Choose TEAM or PUBLIC visibility.');
    }
  }

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
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
  });

  return updated;
};

/**
 * Delete a collection
 */
export const deleteCollection = async (collectionId: string, userId: string) => {
  // Get existing collection
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  // Check if user can modify this collection (owner or team admin)
  const canModify = await canUserModifyCollection(collection, userId);
  if (!canModify) {
    throw new Error('You do not have permission to delete this collection');
  }

  await prisma.collection.delete({
    where: { id: collectionId },
  });

  return { success: true };
};

/**
 * Add a prompt to a collection
 */
export const addPromptToCollection = async (
  collectionId: string,
  promptId: string,
  userId: string,
  order?: number
) => {
  // Get collection
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  // Check permissions: owner can add to any collection, team members can add to team collections
  let canAdd = false;
  if (collection.ownerId === userId) {
    canAdd = true;
  } else if (collection.teamId) {
    // For team collections, any team member can add prompts
    const isMember = await isUserInTeam(userId, collection.teamId);
    canAdd = isMember;
  }

  if (!canAdd) {
    throw new Error('You do not have permission to add prompts to this collection');
  }

  // Verify prompt exists
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    throw new Error('Prompt not found');
  }

  // Check if already in collection
  const existing = await prisma.collectionPrompt.findUnique({
    where: {
      collectionId_promptId: {
        collectionId,
        promptId,
      },
    },
  });

  if (existing) {
    throw new Error('Prompt already in collection');
  }

  // Get the max order if not provided
  const maxOrder = order !== undefined ? order : await getMaxOrderInCollection(collectionId);

  const collectionPrompt = await prisma.collectionPrompt.create({
    data: {
      collectionId,
      promptId,
      order: maxOrder,
    },
    include: {
      prompt: {
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
      },
    },
  });

  return collectionPrompt;
};

/**
 * Remove a prompt from a collection
 */
export const removePromptFromCollection = async (
  collectionId: string,
  promptId: string,
  userId: string
) => {
  // Get collection
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  // Check permissions: owner can remove from any collection, team members can remove from team collections
  let canRemove = false;
  if (collection.ownerId === userId) {
    canRemove = true;
  } else if (collection.teamId) {
    // For team collections, any team member can remove prompts
    const isMember = await isUserInTeam(userId, collection.teamId);
    canRemove = isMember;
  }

  if (!canRemove) {
    throw new Error('You do not have permission to remove prompts from this collection');
  }

  // Check if in collection
  const existing = await prisma.collectionPrompt.findUnique({
    where: {
      collectionId_promptId: {
        collectionId,
        promptId,
      },
    },
  });

  if (!existing) {
    throw new Error('Prompt not in collection');
  }

  await prisma.collectionPrompt.delete({
    where: {
      collectionId_promptId: {
        collectionId,
        promptId,
      },
    },
  });

  return { success: true };
};

/**
 * Helper: Check if user can modify a collection (rename/delete)
 * Returns true if user is the owner OR if it's a team collection and user is a team admin
 */
const canUserModifyCollection = async (
  collection: { ownerId: string; teamId: string | null },
  userId: string
): Promise<boolean> => {
  // Owner can always modify
  if (collection.ownerId === userId) {
    return true;
  }

  // If it's a team collection, check if user is a team admin
  if (collection.teamId) {
    const userRole = await getUserTeamRole(collection.teamId, userId);
    return userRole === TeamMemberRole.ADMIN;
  }

  return false;
};

/**
 * Helper: Check if user is a member of a team
 */
const isUserInTeam = async (userId: string, teamId: string): Promise<boolean> => {
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
 * Helper: Get the max order value in a collection
 */
const getMaxOrderInCollection = async (collectionId: string): Promise<number> => {
  const maxResult = await prisma.collectionPrompt.aggregate({
    where: { collectionId },
    _max: { order: true },
  });
  return (maxResult._max.order || 0) + 1;
};

