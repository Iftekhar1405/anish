-- CreateEnum
CREATE TYPE "Species" AS ENUM ('CATTLE', 'GOAT');

-- CreateEnum
CREATE TYPE "FertilityRating" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AnimalBreedingStatus" AS ENUM ('OPEN', 'INSEMINATED', 'PREGNANT', 'CALVED');

-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "contact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sire_catalogue" (
    "id" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "name" TEXT NOT NULL,
    "breedId" TEXT NOT NULL,
    "organizationId" TEXT,
    "fertilityRating" "FertilityRating" NOT NULL,
    "diseaseFree" BOOLEAN NOT NULL DEFAULT true,
    "strawPriceMinor" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "geneticScore" DOUBLE PRECISION,
    "milkYieldPotential" INTEGER,
    "fatPct" DOUBLE PRECISION,
    "growthIndex" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sire_catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "sireId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "producedOn" TIMESTAMP(3),
    "notes" TEXT,
    "quantityTotal" INTEGER NOT NULL DEFAULT 0,
    "quantityAvailable" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "breedId" TEXT,
    "tag" TEXT NOT NULL,
    "ageMonths" INTEGER,
    "breedingStatus" "AnimalBreedingStatus" NOT NULL DEFAULT 'OPEN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "breeds_species_name_key" ON "breeds"("species", "name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "districts_state_name_key" ON "districts"("state", "name");

-- CreateIndex
CREATE INDEX "service_areas_districtId_idx" ON "service_areas"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "service_areas_districtId_name_key" ON "service_areas"("districtId", "name");

-- CreateIndex
CREATE INDEX "sire_catalogue_species_idx" ON "sire_catalogue"("species");

-- CreateIndex
CREATE INDEX "sire_catalogue_breedId_idx" ON "sire_catalogue"("breedId");

-- CreateIndex
CREATE INDEX "batches_sireId_idx" ON "batches"("sireId");

-- CreateIndex
CREATE UNIQUE INDEX "batches_sireId_batchNumber_key" ON "batches"("sireId", "batchNumber");

-- CreateIndex
CREATE INDEX "animals_farmerId_idx" ON "animals"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "animals_farmerId_tag_key" ON "animals"("farmerId", "tag");

-- AddForeignKey
ALTER TABLE "service_areas" ADD CONSTRAINT "service_areas_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sire_catalogue" ADD CONSTRAINT "sire_catalogue_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sire_catalogue" ADD CONSTRAINT "sire_catalogue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "sire_catalogue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
