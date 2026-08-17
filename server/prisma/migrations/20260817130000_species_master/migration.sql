-- Species becomes an admin-managed master table instead of a two-value enum.
-- Existing rows are carried over, so no animal, breed or sire loses its species.

CREATE TYPE "SpeciesMetrics" AS ENUM ('DAIRY', 'MEAT');

CREATE TABLE "species" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "code"      TEXT,
    "metrics"   "SpeciesMetrics" NOT NULL DEFAULT 'DAIRY',
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "species_name_key" ON "species"("name");

-- The two values the enum used to hold. Fixed ids so the back-fill below can
-- reference them directly.
INSERT INTO "species" ("id", "name", "code", "metrics") VALUES
    ('spc_cattle', 'Cattle', 'CATTLE', 'DAIRY'),
    ('spc_goat',   'Goat',   'GOAT',   'MEAT');

-- ---------------------------------------------------------------- breeds
ALTER TABLE "breeds" ADD COLUMN "speciesId" TEXT;
UPDATE "breeds" SET "speciesId" = CASE WHEN "species" = 'CATTLE' THEN 'spc_cattle' ELSE 'spc_goat' END;
ALTER TABLE "breeds" ALTER COLUMN "speciesId" SET NOT NULL;
DROP INDEX IF EXISTS "breeds_species_name_key";
ALTER TABLE "breeds" DROP COLUMN "species";
CREATE UNIQUE INDEX "breeds_speciesId_name_key" ON "breeds"("speciesId", "name");
CREATE INDEX "breeds_speciesId_idx" ON "breeds"("speciesId");
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_speciesId_fkey"
    FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --------------------------------------------------------------- animals
ALTER TABLE "animals" ADD COLUMN "speciesId" TEXT;
UPDATE "animals" SET "speciesId" = CASE WHEN "species" = 'CATTLE' THEN 'spc_cattle' ELSE 'spc_goat' END;
ALTER TABLE "animals" ALTER COLUMN "speciesId" SET NOT NULL;
ALTER TABLE "animals" DROP COLUMN "species";
CREATE INDEX "animals_speciesId_idx" ON "animals"("speciesId");
ALTER TABLE "animals" ADD CONSTRAINT "animals_speciesId_fkey"
    FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- -------------------------------------------------------- sire_catalogue
ALTER TABLE "sire_catalogue" ADD COLUMN "speciesId" TEXT;
UPDATE "sire_catalogue" SET "speciesId" = CASE WHEN "species" = 'CATTLE' THEN 'spc_cattle' ELSE 'spc_goat' END;
ALTER TABLE "sire_catalogue" ALTER COLUMN "speciesId" SET NOT NULL;
DROP INDEX IF EXISTS "sire_catalogue_species_idx";
ALTER TABLE "sire_catalogue" DROP COLUMN "species";
CREATE INDEX "sire_catalogue_speciesId_idx" ON "sire_catalogue"("speciesId");
ALTER TABLE "sire_catalogue" ADD CONSTRAINT "sire_catalogue_speciesId_fkey"
    FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TYPE "Species";
