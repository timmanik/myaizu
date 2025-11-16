import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { Role } from '@prisma/client';

/**
 * TEAM MANAGEMENT
 */

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Team name is required',
      });
    }

    const team = await adminService.createTeam({
      name,
      description,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create team',
    });
  }
};

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const teams = await adminService.getAllTeams({
      search: search as string,
    });

    res.json({
      success: true,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch teams',
    });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await adminService.updateTeam(id, { name, description });

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update team',
    });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await adminService.deleteTeam(id);

    res.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete team',
    });
  }
};

export const assignTeamAdmin = async (req: Request, res: Response) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const membership = await adminService.assignTeamAdmin(teamId, userId);

    return res.json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to assign team admin',
    });
  }
};

export const removeTeamAdmin = async (req: Request, res: Response) => {
  try {
    const { id: teamId, userId } = req.params;

    const membership = await adminService.removeTeamAdmin(teamId, userId);

    res.json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to remove team admin',
    });
  }
};

/**
 * USER MANAGEMENT
 */

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query;

    const users = await adminService.getAllUsers({
      search: search as string,
      role: role as Role,
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users',
    });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required',
      });
    }

    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    const user = await adminService.updateUserRole(userId, role);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update user role',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    // Prevent users from deleting themselves
    if (userId === req.user!.userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account',
      });
    }

    await adminService.deleteUser(userId);

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to delete user',
    });
  }
};

/**
 * STATISTICS
 */

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const stats = await adminService.getAdminStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics',
    });
  }
};

