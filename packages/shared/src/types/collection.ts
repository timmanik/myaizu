// Collection-related types

export enum CollectionVisibility {
  PUBLIC = 'PUBLIC',
  TEAM = 'TEAM',
  PRIVATE = 'PRIVATE',
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  visibility: CollectionVisibility;
  ownerId: string;
  teamId: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Optional populated relations
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  team?: {
    id: string;
    name: string;
  };
  _count?: {
    collectionPrompts: number;
  };
}

export interface CollectionPrompt {
  id: string;
  collectionId: string;
  promptId: string;
  order: number;
  createdAt: Date;
  
  // Optional populated relations
  prompt?: {
    id: string;
    title: string;
    content: string;
    description: string | null;
    platform: string;
    visibility: string;
    tags: string[];
    authorId: string;
    favoriteCount: number;
    copyCount: number;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  };
}

export interface CollectionWithPrompts extends Collection {
  collectionPrompts: CollectionPrompt[];
}

export interface CollectionWithCount extends Collection {
  promptCount: number;
}

// DTOs for API requests
export interface CreateCollectionDto {
  name: string;
  description?: string;
  visibility?: CollectionVisibility;
  teamId?: string;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  visibility?: CollectionVisibility;
  teamId?: string;
}

export interface AddPromptToCollectionDto {
  promptId: string;
  order?: number;
}

export interface UpdateCollectionPromptOrderDto {
  order: number;
}

// Filter and query types
export interface CollectionFilters {
  search?: string;
  visibility?: CollectionVisibility;
  ownerId?: string;
  teamId?: string;
  sortField?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

