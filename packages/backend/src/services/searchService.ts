import { PrismaClient } from '@prisma/client';
import type { Prompt as SharedPrompt } from '@aizu/shared';

const prisma = new PrismaClient();

export interface SearchCollection {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  ownerId: string;
  ownerName?: string;
  teamId: string | null;
  promptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchTeam {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  promptCount: number;
  userRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface SearchResult {
  prompts: SharedPrompt[];
  collections: SearchCollection[];
  teams: SearchTeam[];
  users: SearchUser[];
}

export class SearchService {
  /**
   * Unified search across all entity types
   */
  async searchAll(
    query: string,
    userId: string,
    limit = 10
  ): Promise<SearchResult> {
    const [prompts, collections, teams, users] = await Promise.all([
      this.searchPrompts(query, userId, limit),
      this.searchCollections(query, userId, limit),
      this.searchTeams(query, userId, limit),
      this.searchUsers(query, limit),
    ]);

    return {
      prompts,
      collections,
      teams,
      users,
    };
  }

  /**
   * Search prompts by title, content, and description
   */
  async searchPrompts(
    query: string,
    userId: string,
    limit = 20
  ): Promise<SharedPrompt[]> {
    const prompts = await prisma.prompt.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
          // Only show prompts the user can access
          {
            OR: [
              { authorId: userId },
              { visibility: 'PUBLIC' },
              // Team prompts where user is a member
              {
                AND: [
                  { visibility: 'TEAM' },
                  {
                    team: {
                      members: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        { favoriteCount: 'desc' },
        { createdAt: 'desc' },
      ],
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
   * Search collections by name and description
   */
  async searchCollections(
    query: string,
    userId: string,
    limit = 20
  ): Promise<SearchCollection[]> {
    const collections = await prisma.collection.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
          // Only show collections the user can access
          {
            OR: [
              { ownerId: userId },
              { visibility: 'PUBLIC' },
              {
                AND: [
                  { visibility: 'TEAM' },
                  {
                    team: {
                      members: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
      ],
      include: {
        owner: {
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

    return collections.map((c) => this.mapCollectionToShared(c));
  }

  /**
   * Search teams by name and description
   */
  async searchTeams(
    query: string,
    userId: string,
    limit = 20
  ): Promise<SearchTeam[]> {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
      ],
      include: {
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            prompts: true,
          },
        },
      },
    });

    return teams.map((t) => this.mapTeamToShared(t, userId));
  }

  /**
   * Search users by name and email
   */
  async searchUsers(
    query: string,
    limit = 20
  ): Promise<SearchUser[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return users;
  }

  // Helper methods for mapping

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

  private mapCollectionToShared(collection: any): SearchCollection {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      visibility: collection.visibility,
      ownerId: collection.ownerId,
      ownerName: collection.owner?.name,
      teamId: collection.teamId,
      promptCount: collection._count?.collectionPrompts || 0,
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
    };
  }

  private mapTeamToShared(team: any, _userId: string): SearchTeam {
    const userMembership = team.members?.[0];
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      memberCount: team._count?.members || 0,
      promptCount: team._count?.prompts || 0,
      userRole: userMembership?.role || null,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    };
  }
}

export const searchService = new SearchService();

