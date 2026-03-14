import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as collectionService from '../services/collectionService';
import { CollectionVisibility } from '@aizu/shared';
import { sendData, sendMessage } from '../utils/apiResponse';

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
export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
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

    sendData(res, collections);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/collections/:id
 * Get a single collection by ID (with prompts)
 */
export const getCollectionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collection = await collectionService.getCollectionById(id, userId);

    sendData(res, collection);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/collections
 * Create a new collection
 */
export const createCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const validatedData = createCollectionSchema.parse(req.body);

    const collection = await collectionService.createCollection(userId, validatedData);

    sendData(res, collection, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/collections/:id
 * Update a collection
 */
export const updateCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const validatedData = updateCollectionSchema.parse(req.body);

    const collection = await collectionService.updateCollection(id, userId, validatedData);

    sendData(res, collection);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/collections/:id
 * Delete a collection
 */
export const deleteCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await collectionService.deleteCollection(id, userId);

    sendMessage(res, 'Collection deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/collections/:id/prompts
 * Add a prompt to a collection
 */
export const addPromptToCollection = async (req: Request, res: Response, next: NextFunction) => {
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

    sendData(res, collectionPrompt, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/collections/:id/prompts/:promptId
 * Remove a prompt from a collection
 */
export const removePromptFromCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id, promptId } = req.params;

    await collectionService.removePromptFromCollection(id, promptId, userId);

    sendMessage(res, 'Prompt removed from collection successfully');
  } catch (error) {
    next(error);
  }
};
