import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Admin and Technician accounts are never self-registered (see AuthService) —
// they only exist once seeded here or created via admin CRUD (Phase 4).
// Farmer accounts self-provision on first OTP verify, so none is seeded.
async function main(): Promise<void> {
  const adminPhone = process.env.SEED_ADMIN_PHONE ?? '+10000000001';
  const technicianPhone = process.env.SEED_TECHNICIAN_PHONE ?? '+10000000002';

  await prisma.user.upsert({
    where: { phone_role: { phone: adminPhone, role: Role.ADMIN } },
    update: {},
    create: { phone: adminPhone, role: Role.ADMIN, name: 'Default Admin' },
  });

  await prisma.user.upsert({
    where: { phone_role: { phone: technicianPhone, role: Role.TECHNICIAN } },
    update: {},
    create: { phone: technicianPhone, role: Role.TECHNICIAN, name: 'Default Technician' },
  });

  console.log(`Seeded ADMIN (${adminPhone}) and TECHNICIAN (${technicianPhone}).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
