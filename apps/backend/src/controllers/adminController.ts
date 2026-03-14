import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { Role } from '@prisma/client';
import { BadRequestError } from '../middleware/errorHandler';
import { sendData, sendMessage } from '../utils/apiResponse';

/**
 * TEAM MANAGEMENT
 */

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.userId;

    if (!name) {
      throw new BadRequestError('Team name is required');
    }

    const team = await adminService.createTeam({
      name,
      description,
      createdBy: userId,
    });

    return sendData(res, team, 201);
  } catch (error) {
    return next(error);
  }
};

export const getAllTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;

    const teams = await adminService.getAllTeams({
      search: search as string,
    });

    sendData(res, teams);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await adminService.updateTeam(id, { name, description });

    sendData(res, team);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await adminService.deleteTeam(id);

    sendMessage(res, 'Team deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignTeamAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const membership = await adminService.assignTeamAdmin(teamId, userId);

    return sendData(res, membership);
  } catch (error) {
    return next(error);
  }
};

export const removeTeamAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: teamId, userId } = req.params;

    const membership = await adminService.removeTeamAdmin(teamId, userId);

    sendData(res, membership);
  } catch (error) {
    next(error);
  }
};

/**
 * USER MANAGEMENT
 */

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role } = req.query;

    const users = await adminService.getAllUsers({
      search: search as string,
      role: role as Role,
    });

    sendData(res, users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new BadRequestError('Role is required');
    }

    if (!Object.values(Role).includes(role)) {
      throw new BadRequestError('Invalid role');
    }

    const user = await adminService.updateUserRole(userId, role);

    return sendData(res, user);
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = req.params;

    // Prevent users from deleting themselves
    if (userId === req.user!.userId) {
      throw new BadRequestError('You cannot delete your own account');
    }

    await adminService.deleteUser(userId);

    return sendMessage(res, 'User deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * STATISTICS
 */

export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getAdminStats();

    sendData(res, stats);
  } catch (error) {
    next(error);
  }
};
