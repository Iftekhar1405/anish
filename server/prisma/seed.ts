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
 * Every district of Chhattisgarh (33 as of the September 2022 reorganisation,
 * which split out Manendragarh-Chirmiri-Bharatpur, Sarangarh-Bilaigarh, Sakti,
 * Mohla-Manpur-Ambagarh Chowki and Khairagarh-Chhuikhadan-Gandai).
 *
 * Seeded rather than left to hand-entry because a farmer picks their district
 * during onboarding: an empty list blocks registration, and admins typing 33
 * names by hand produces the spelling drift ("Kabirdham" vs "Kawardha") that
 * makes district filters on reports silently under-count.
 *
 * Deliberately Chhattisgarh-only, not all-India. The farmer app's picker
 * requests `/districts?pageSize=100` unfiltered, so a national list (~780 rows)
 * would truncate and hide most districts. Widening to other states means adding
 * a state filter to that picker first.
 *
 * `code` is the state vehicle-registration/LGD short code where one is in
 * common use; districts without a settled code are left null.
 */
const CHHATTISGARH_DISTRICTS: { name: string; code?: string }[] = [
  { name: 'Balod' },
  { name: 'Baloda Bazar-Bhatapara' },
  { name: 'Balrampur' },
  { name: 'Bastar', code: 'BA' },
  { name: 'Bemetara' },
  { name: 'Bijapur' },
  { name: 'Bilaspur', code: 'BI' },
  { name: 'Dantewada', code: 'DA' },
  { name: 'Dhamtari', code: 'DH' },
  { name: 'Durg', code: 'DU' },
  { name: 'Gariaband', code: 'GB' },
  { name: 'Gaurela-Pendra-Marwahi', code: 'GPM' },
  { name: 'Janjgir-Champa', code: 'JC' },
  { name: 'Jashpur', code: 'JA' },
  { name: 'Kabirdham', code: 'KW' },
  { name: 'Kanker', code: 'KK' },
  { name: 'Khairagarh-Chhuikhadan-Gandai', code: 'KCG' },
  { name: 'Kondagaon' },
  { name: 'Korba', code: 'KB' },
  { name: 'Koriya', code: 'KJ' },
  { name: 'Mahasamund', code: 'MA' },
  { name: 'Manendragarh-Chirmiri-Bharatpur', code: 'MCB' },
  { name: 'Mohla-Manpur-Ambagarh Chowki', code: 'MM' },
  { name: 'Mungeli' },
  { name: 'Narayanpur' },
  { name: 'Raigarh', code: 'RG' },
  { name: 'Raipur', code: 'RP' },
  { name: 'Rajnandgaon', code: 'RN' },
  { name: 'Sakti', code: 'SKT' },
  { name: 'Sarangarh-Bilaigarh', code: 'SB' },
  { name: 'Sukma', code: 'SK' },
  { name: 'Surajpur', code: 'SJ' },
  { name: 'Surguja', code: 'SU' },
];

const CHHATTISGARH = 'Chhattisgarh';

/**
 * Seeds the non-self-registering accounts (Admin, Technician) so all three apps
 * can be exercised, plus the species, breed and district reference lists.
 * Farmers self-register via POST /auth/register. Re-running is safe —
 * everything here upserts, and `update: {}` means a row an admin edited is
 * never overwritten.
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

  for (const district of CHHATTISGARH_DISTRICTS) {
    await prisma.district.upsert({
      where: { state_name: { state: CHHATTISGARH, name: district.name } },
      update: {},
      create: { state: CHHATTISGARH, name: district.name, code: district.code },
    });
  }
  console.log(
    `Seeded ${CHHATTISGARH_DISTRICTS.length} ${CHHATTISGARH} district(s)`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
