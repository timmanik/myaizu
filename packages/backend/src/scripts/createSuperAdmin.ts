/**
 * Script to create an initial Super Admin user
 * Run with: pnpm tsx src/scripts/createSuperAdmin.ts
 */
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../utils/password';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@aizu.local';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123456';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Super Admin with email ${email} already exists`);
    process.exit(0);
  }

  // Create super admin
  const hashedPassword = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('Super Admin created successfully!');
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${password}`);
  console.log(`Please change the password after first login!`);
}

main()
  .catch((e) => {
    console.error('Error creating Super Admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

