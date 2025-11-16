import { PrismaClient } from '@prisma/client';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilters,
  CollectionVisibility,
} from '@aizu/shared';

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

  // If teamId is provided and visibility is TEAM, verify user is in the team
  if (teamId && visibility === CollectionVisibility.TEAM) {
    const isMember = await isUserInTeam(userId, teamId);
    if (!isMember) {
      throw new Error('You must be a member of the team to create a team collection');
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

  // Check ownership
  if (collection.ownerId !== userId) {
    throw new Error('Only the collection owner can update it');
  }

  // If changing to team visibility, verify user is in the team
  if (data.teamId && data.visibility === CollectionVisibility.TEAM) {
    const isMember = await isUserInTeam(userId, data.teamId);
    if (!isMember) {
      throw new Error('You must be a member of the team to create a team collection');
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

  // Check ownership
  if (collection.ownerId !== userId) {
    throw new Error('Only the collection owner can delete it');
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
  // Get collection and verify ownership
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  if (collection.ownerId !== userId) {
    throw new Error('Only the collection owner can add prompts');
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
  // Get collection and verify ownership
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  if (collection.ownerId !== userId) {
    throw new Error('Only the collection owner can remove prompts');
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

