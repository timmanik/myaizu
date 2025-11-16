import { Request, Response } from 'express';
import * as organizationService from '../services/organizationService';

/**
 * Get organization settings
 * Available to all authenticated users
 */
export const getOrganization = async (_req: Request, res: Response) => {
  try {
    const organization = await organizationService.getOrganization();

    res.json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization',
    });
  }
};

/**
 * Update organization settings
 * Super Admin only
 */
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { name, logoUrl } = req.body;

    const organization = await organizationService.updateOrganization({
      name,
      logoUrl,
    });

    res.json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update organization',
    });
  }
};

