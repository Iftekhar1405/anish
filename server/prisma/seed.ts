import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/common/crypto.util';

const prisma = new PrismaClient();

/**
 * Seeds the non-self-registering accounts (Admin, Technician) so all three apps
 * can be exercised. Farmers self-register via POST /auth/register.
 */
async function main(): Promise<void> {
  const password = process.env.SEED_PASSWORD ?? 'Password@123';
  const accounts = [
    {
      phone: process.env.SEED_ADMIN_PHONE ?? '+10000000001',
      role: Role.ADMIN,
      name: 'Seed Admin',
    },
    {
      phone: process.env.SEED_TECHNICIAN_PHONE ?? '+10000000002',
      role: Role.TECHNICIAN,
      name: 'Seed Technician',
    },
  ];

  for (const acc of accounts) {
    await prisma.user.upsert({
      where: { phone_role: { phone: acc.phone, role: acc.role } },
      update: {},
      create: { ...acc, passwordHash: await hashPassword(password) },
    });
    console.log(`Seeded ${acc.role} ${acc.phone}`);
  }
  console.log(`Seed password: ${password}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
