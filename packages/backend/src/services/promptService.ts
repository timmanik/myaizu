import { PrismaClient, Prisma } from '@prisma/client';
import type {
  CreatePromptDto,
  UpdatePromptDto,
  PromptFilters,
  PromptSort,
  Prompt as SharedPrompt,
} from '@aizu/shared';

const prisma = new PrismaClient();

export class PromptService {
  /**
   * Create a new prompt
   */
  async createPrompt(
    userId: string,
    data: CreatePromptDto
  ): Promise<SharedPrompt> {
    const prompt = await prisma.prompt.create({
      data: {
        title: data.title,
        content: data.content,
        description: data.description,
        variables: (data.variables || []) as any,
        platform: data.platform,
        visibility: data.visibility,
        tags: data.tags || [],
        promptType: data.promptType,
        additionalInstructions: data.additionalInstructions,
        config: data.config as any,
        authorId: userId,
        teamId: data.teamId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapPromptToShared(prompt, userId);
  }

  /**
   * Get a prompt by ID with permission check
   */
  async getPrompt(promptId: string, userId: string): Promise<SharedPrompt | null> {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        favorites: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!prompt) {
      return null;
    }

    // Check visibility permissions
    if (!this.canViewPrompt(prompt, userId)) {
      return null;
    }

    return this.mapPromptToShared(prompt, userId);
  }

  /**
   * List prompts with filters and pagination
   */
  async listPrompts(
    userId: string,
    filters: PromptFilters = {},
    sort: PromptSort = { field: 'createdAt', order: 'desc' },
    page = 1,
    limit = 20
  ): Promise<{ prompts: SharedPrompt[]; total: number }> {
    const where = this.buildWhereClause(userId, filters);
    const orderBy = this.buildOrderBy(sort);

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          favorites: {
            where: { userId },
            select: { id: true },
          },
        },
      }),
      prisma.prompt.count({ where }),
    ]);

    return {
      prompts: prompts.map((p) => this.mapPromptToShared(p, userId)),
      total,
    };
  }

  /**
   * Update a prompt (owner only)
   */
  async updatePrompt(
    promptId: string,
    userId: string,
    data: UpdatePromptDto
  ): Promise<SharedPrompt> {
    // Check ownership
    const existing = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!existing || existing.authorId !== userId) {
      throw new Error('Not authorized to update this prompt');
    }

    const updateData: Prisma.PromptUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.variables !== undefined) updateData.variables = data.variables as any;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.promptType !== undefined) updateData.promptType = data.promptType;
    if (data.additionalInstructions !== undefined) updateData.additionalInstructions = data.additionalInstructions;
    if (data.config !== undefined) updateData.config = data.config as any;
    
    // Handle teamId with connect/disconnect
    if (data.teamId !== undefined) {
      if (data.teamId === null) {
        updateData.team = { disconnect: true };
      } else {
        updateData.team = { connect: { id: data.teamId } };
      }
    }

    const prompt = await prisma.prompt.update({
      where: { id: promptId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapPromptToShared(prompt, userId);
  }

  /**
   * Delete a prompt (owner only)
   */
  async deletePrompt(promptId: string, userId: string): Promise<void> {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt || prompt.authorId !== userId) {
      throw new Error('Not authorized to delete this prompt');
    }

    await prisma.prompt.delete({
      where: { id: promptId },
    });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(
    promptId: string,
    userId: string
  ): Promise<{ isFavorited: boolean }> {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });

    if (existing) {
      // Remove favorite
      await prisma.$transaction([
        prisma.favorite.delete({
          where: { id: existing.id },
        }),
        prisma.prompt.update({
          where: { id: promptId },
          data: { favoriteCount: { decrement: 1 } },
        }),
      ]);
      return { isFavorited: false };
    } else {
      // Add favorite
      await prisma.$transaction([
        prisma.favorite.create({
          data: {
            userId,
            promptId,
          },
        }),
        prisma.prompt.update({
          where: { id: promptId },
          data: { favoriteCount: { increment: 1 } },
        }),
      ]);
      return { isFavorited: true };
    }
  }

  /**
   * Increment copy count
   */
  async incrementCopyCount(promptId: string): Promise<void> {
    await prisma.prompt.update({
      where: { id: promptId },
      data: { copyCount: { increment: 1 } },
    });
  }

  /**
   * Fork/remix a prompt
   */
  async forkPrompt(promptId: string, userId: string): Promise<SharedPrompt> {
    // Get the original prompt
    const originalPrompt = await this.getPrompt(promptId, userId);
    
    if (!originalPrompt) {
      throw new Error('Prompt not found or you do not have permission to fork it');
    }
    
    // Increment the copy count of the original
    await this.incrementCopyCount(promptId);

    // Create a new prompt based on the original
    const forkedPrompt = await prisma.prompt.create({
      data: {
        title: `${originalPrompt.title} (Remix)`,
        content: originalPrompt.content,
        description: originalPrompt.description,
        variables: originalPrompt.variables as any,
        platform: originalPrompt.platform,
        visibility: 'PRIVATE', // New forked prompts are private by default
        tags: originalPrompt.tags,
        promptType: originalPrompt.promptType,
        additionalInstructions: originalPrompt.additionalInstructions,
        config: originalPrompt.config as any,
        authorId: userId, // New author is the user forking
        teamId: null, // Forked prompts don't belong to teams initially
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapPromptToShared(forkedPrompt, userId);
  }


  // Helper methods

  private canViewPrompt(prompt: any, userId: string): boolean {
    // Owner can always view
    if (prompt.authorId === userId) {
      return true;
    }

    // Public prompts are visible to all
    if (prompt.visibility === 'PUBLIC') {
      return true;
    }

    // Private prompts only visible to owner
    if (prompt.visibility === 'PRIVATE') {
      return false;
    }

    // Team prompts - will be implemented in Phase 3
    // For now, treat as private
    if (prompt.visibility === 'TEAM') {
      return false;
    }

    return false;
  }

  private buildWhereClause(
    userId: string,
    filters: PromptFilters
  ): Prisma.PromptWhereInput {
    const where: Prisma.PromptWhereInput = {};

    // Filter by platform
    if (filters.platform) {
      where.platform = filters.platform;
    }

    // Filter by visibility
    if (filters.visibility) {
      where.visibility = filters.visibility;
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    // Filter by author
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    // Filter by team (Phase 3)
    if (filters.teamId) {
      where.teamId = filters.teamId;
    }

    // Filter by favorited
    if (filters.isFavorited) {
      where.favorites = {
        some: {
          userId,
        },
      };
    }

    // Build the OR conditions for search and visibility
    const orConditions: Prisma.PromptWhereInput[] = [];
    
    // Apply visibility rules if not filtering by specific author
    if (!filters.authorId) {
      const visibilityConditions: Prisma.PromptWhereInput[] = [
        // User's own prompts
        { authorId: userId },
        // Public prompts
        { visibility: 'PUBLIC' },
        // Team prompts (Phase 3 - for now will be empty)
        // { visibility: 'TEAM', teamId: { in: userTeamIds } },
      ];
      
      // If there's a search, combine search with each visibility condition
      if (filters.search) {
        const searchConditions = [
          { title: { contains: filters.search, mode: 'insensitive' as const } },
          { content: { contains: filters.search, mode: 'insensitive' as const } },
        ];
        
        // Create combined conditions: (visibility1 AND (searchTitle OR searchContent)) OR (visibility2 AND ...)
        visibilityConditions.forEach(visCondition => {
          searchConditions.forEach(searchCondition => {
            orConditions.push({
              AND: [visCondition, searchCondition]
            });
          });
        });
      } else {
        // No search, just use visibility conditions
        orConditions.push(...visibilityConditions);
      }
    } else {
      // When filtering by specific author, just apply search if present
      if (filters.search) {
        orConditions.push(
          { title: { contains: filters.search, mode: 'insensitive' as const } },
          { content: { contains: filters.search, mode: 'insensitive' as const } }
        );
      }
    }

    // Apply OR conditions if any exist
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    return where;
  }

  private buildOrderBy(sort: PromptSort): Prisma.PromptOrderByWithRelationInput {
    return {
      [sort.field]: sort.order,
    };
  }

  private mapPromptToShared(prompt: any, _userId: string): SharedPrompt {
    return {
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      variables: prompt.variables as any,
      platform: prompt.platform,
      visibility: prompt.visibility,
      tags: prompt.tags,
      promptType: prompt.promptType,
      additionalInstructions: prompt.additionalInstructions,
      config: prompt.config as any,
      authorId: prompt.authorId,
      authorName: prompt.author?.name,
      teamId: prompt.teamId,
      copyCount: prompt.copyCount,
      favoriteCount: prompt.favoriteCount,
      isFavorited: prompt.favorites?.length > 0,
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
    };
  }
}

export const promptService = new PromptService();

