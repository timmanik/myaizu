import { PrismaClient } from '@prisma/client';
import type { Prompt as SharedPrompt } from '@aizu/shared';

const prisma = new PrismaClient();

export class TrendingService {
  /**
   * Get most favorited prompts in the last N days
   */
  async getMostFavorited(
    userId: string,
    days: number = 7,
    limit: number = 20
  ): Promise<SharedPrompt[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const prompts = await prisma.prompt.findMany({
      where: {
        visibility: 'PUBLIC',
        createdAt: {
          gte: dateThreshold,
        },
      },
      orderBy: [
        { favoriteCount: 'desc' },
        { createdAt: 'desc' },
      ],
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
    });

    return prompts.map((p) => this.mapPromptToShared(p, userId));
  }

  /**
   * Get fast rising prompts (high favorite velocity)
   * Uses a combination of recent favorites and recency
   */
  async getFastRising(
    userId: string,
    days: number = 7,
    limit: number = 20
  ): Promise<SharedPrompt[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get prompts with their favorite counts
    const prompts = await prisma.prompt.findMany({
      where: {
        visibility: 'PUBLIC',
        createdAt: {
          gte: dateThreshold,
        },
      },
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
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    // Calculate trending score: (favorites / age_in_days)
    // Higher score = faster rising
    const now = new Date();
    const scoredPrompts = prompts.map((prompt) => {
      const ageInDays = Math.max(
        (now.getTime() - prompt.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        0.1 // Minimum age to avoid division by zero
      );
      const score = prompt.favoriteCount / ageInDays;
      return { prompt, score };
    });

    // Sort by score descending
    scoredPrompts.sort((a, b) => b.score - a.score);

    // Take top N
    return scoredPrompts
      .slice(0, limit)
      .map(({ prompt }) => this.mapPromptToShared(prompt, userId));
  }

  /**
   * Get newest public prompts
   */
  async getNew(userId: string, limit: number = 20): Promise<SharedPrompt[]> {
    const prompts = await prisma.prompt.findMany({
      where: {
        visibility: 'PUBLIC',
      },
      orderBy: {
        createdAt: 'desc',
      },
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
    });

    return prompts.map((p) => this.mapPromptToShared(p, userId));
  }

  /**
   * Get all trending categories in one call (for overview)
   */
  async getTrendingOverview(
    userId: string
  ): Promise<{
    mostFavorited: SharedPrompt[];
    fastRising: SharedPrompt[];
    new: SharedPrompt[];
  }> {
    const [mostFavorited, fastRising, newPrompts] = await Promise.all([
      this.getMostFavorited(userId, 7, 5),
      this.getFastRising(userId, 7, 5),
      this.getNew(userId, 5),
    ]);

    return {
      mostFavorited,
      fastRising,
      new: newPrompts,
    };
  }

  // Helper method to map prompt to shared type
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

export const trendingService = new TrendingService();


