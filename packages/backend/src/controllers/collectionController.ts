import { Request, Response } from 'express';
import { z } from 'zod';
import * as collectionService from '../services/collectionService';
import { CollectionVisibility } from '@aizu/shared';

// Validation schemas
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.nativeEnum(CollectionVisibility).optional(),
  teamId: z.string().optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  visibility: z.nativeEnum(CollectionVisibility).optional(),
  teamId: z.string().optional(),
});

const addPromptSchema = z.object({
  promptId: z.string(),
  order: z.number().int().min(0).optional(),
});

/**
 * GET /api/collections
 * Get all collections accessible to the current user
 */
export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const filters = {
      search: req.query.search as string | undefined,
      visibility: req.query.visibility as CollectionVisibility | undefined,
      ownerId: req.query.ownerId as string | undefined,
      teamId: req.query.teamId as string | undefined,
      sortField: (req.query.sortField as any) || 'createdAt',
      sortOrder: (req.query.sortOrder as any) || 'desc',
    };

    const collections = await collectionService.getCollections(userId, filters);

    res.json({
      success: true,
      data: collections,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch collections',
    });
  }
};

/**
 * GET /api/collections/:id
 * Get a single collection by ID (with prompts)
 */
export const getCollectionById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collection = await collectionService.getCollectionById(id, userId);

    res.json({
      success: true,
      data: collection,
    });
  } catch (error: any) {
    if (error.message === 'Collection not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message === 'Access denied') {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch collection',
      });
    }
  }
};

/**
 * POST /api/collections
 * Create a new collection
 */
export const createCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = createCollectionSchema.parse(req.body);

    const collection = await collectionService.createCollection(userId, validatedData);

    res.status(201).json({
      success: true,
      data: collection,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create collection',
      });
    }
  }
};

/**
 * PUT /api/collections/:id
 * Update a collection
 */
export const updateCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const validatedData = updateCollectionSchema.parse(req.body);

    const collection = await collectionService.updateCollection(id, userId, validatedData);

    res.json({
      success: true,
      data: collection,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else if (error.message === 'Collection not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('owner')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update collection',
      });
    }
  }
};

/**
 * DELETE /api/collections/:id
 * Delete a collection
 */
export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await collectionService.deleteCollection(id, userId);

    res.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Collection not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('owner')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete collection',
      });
    }
  }
};

/**
 * POST /api/collections/:id/prompts
 * Add a prompt to a collection
 */
export const addPromptToCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const validatedData = addPromptSchema.parse(req.body);

    const collectionPrompt = await collectionService.addPromptToCollection(
      id,
      validatedData.promptId,
      userId,
      validatedData.order
    );

    res.status(201).json({
      success: true,
      data: collectionPrompt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('already in collection')) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('owner')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add prompt to collection',
      });
    }
  }
};

/**
 * DELETE /api/collections/:id/prompts/:promptId
 * Remove a prompt from a collection
 */
export const removePromptFromCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id, promptId } = req.params;

    await collectionService.removePromptFromCollection(id, promptId, userId);

    res.json({
      success: true,
      message: 'Prompt removed from collection successfully',
    });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('not in collection')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('owner')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove prompt from collection',
      });
    }
  }
};

