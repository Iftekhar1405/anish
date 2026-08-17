import { PrismaClient, Role, SpeciesMetrics } from '@prisma/client';
import { hashPassword } from '../src/common/crypto.util';

const prisma = new PrismaClient();

/** The species the platform ships with. Admin can add more from Masters → Species. */
const SPECIES = [
  { name: 'Cattle', code: 'CATTLE', metrics: SpeciesMetrics.DAIRY },
  { name: 'Goat', code: 'GOAT', metrics: SpeciesMetrics.MEAT },
];

/**
 * Breeds farmers here actually keep. Without these the breed dropdown in the
 * farmer app is effectively empty, which is why animals were being recorded
 * with no breed at all. Admin can still add to (or deactivate) any of these
 * from Masters → Breeds, and a farmer whose breed isn't listed can type it in.
 */
const BREEDS: Record<string, string[]> = {
  Cattle: [
    'Gir',
    'Sahiwal',
    'Red Sindhi',
    'Tharparkar',
    'Rathi',
    'Kankrej',
    'Ongole',
    'Hariana',
    'Deoni',
    'Khillari',
    'Hallikar',
    'Amritmahal',
    'Vechur',
    'Punganur',
    'Holstein Friesian',
    'Jersey',
    'HF Cross',
    'Jersey Cross',
    'Non-descript / Local',
  ],
  Goat: [
    'Jamnapari',
    'Barbari',
    'Beetal',
    'Sirohi',
    'Osmanabadi',
    'Malabari',
    'Black Bengal',
    'Sojat',
    'Totapuri',
    'Kota',
    'Marwari',
    'Surti',
    'Jakhrana',
    'Boer',
    'Non-descript / Local',
  ],
};

/**
 * Seeds the non-self-registering accounts (Admin, Technician) so all three apps
 * can be exercised, plus the species and breed reference lists. Farmers
 * self-register via POST /auth/register. Re-running is safe — everything here
 * upserts, and `update: {}` means a row an admin edited is never overwritten.
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

  for (const species of SPECIES) {
    const row = await prisma.species.upsert({
      where: { name: species.name },
      update: {},
      create: species,
    });
    const names = BREEDS[species.name] ?? [];
    for (const name of names) {
      await prisma.breed.upsert({
        where: { speciesId_name: { speciesId: row.id, name } },
        update: {},
        create: { speciesId: row.id, name },
      });
    }
    console.log(`Seeded species ${row.name} with ${names.length} breed(s)`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
