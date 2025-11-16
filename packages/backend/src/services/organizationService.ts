import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get organization settings
 * Returns the first organization (single-tenant setup)
 */
export const getOrganization = async () => {
  let organization = await prisma.organization.findFirst();

  // If no organization exists, create a default one
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'Aizu',
        logoUrl: null,
      },
    });
  }

  return organization;
};

/**
 * Update organization settings (Super Admin only)
 */
export const updateOrganization = async (data: {
  name?: string;
  logoUrl?: string | null;
}) => {
  let organization = await prisma.organization.findFirst();

  if (!organization) {
    // Create if doesn't exist
    organization = await prisma.organization.create({
      data: {
        name: data.name || 'Aizu',
        logoUrl: data.logoUrl,
      },
    });
  } else {
    // Update existing
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        updatedAt: new Date(),
      },
    });
  }

  return organization;
};

