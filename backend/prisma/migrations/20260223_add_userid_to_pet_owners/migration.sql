-- Migration: Replace clerkUserId with userId in pet_owners and staff
-- This migration replaces the old clerkUserId FK with userId FK to users.id
-- Safe to deploy with zero downtime

-- ============================================
-- PART A: Users table changes
-- ============================================

-- Step 1: Add imageUrl to users table (non-breaking)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Step 2: Make users.clerkUserId nullable (non-breaking, allows placeholder users)
ALTER TABLE "users" ALTER COLUMN "clerkUserId" DROP NOT NULL;

-- ============================================
-- PART B: PetOwners table migration
-- ============================================

-- Step 3: Add the new userId column to pet_owners (nullable initially)
ALTER TABLE "pet_owners" ADD COLUMN "userId" TEXT;

-- Step 4: Populate userId from the existing clerkUserId relationship
UPDATE "pet_owners" po
SET "userId" = u."id"
FROM "users" u
WHERE po."clerkUserId" = u."clerkUserId";

-- Step 5: Verify all pet_owners records were populated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "pet_owners" WHERE "userId" IS NULL) THEN
    RAISE EXCEPTION 'Migration failed: Some pet_owners have NULL userId after population. Check for orphaned records.';
  END IF;
END $$;

-- Step 6: Make userId NOT NULL after successful population
ALTER TABLE "pet_owners" ALTER COLUMN "userId" SET NOT NULL;

-- Step 7: Drop the OLD foreign key constraint on clerkUserId
ALTER TABLE "pet_owners" DROP CONSTRAINT IF EXISTS "pet_owners_clerkUserId_fkey";

-- Step 8: Drop the OLD unique index on clerkUserId
DROP INDEX IF EXISTS "pet_owners_clerkUserId_key";

-- Step 9: Drop the OLD clerkUserId column
ALTER TABLE "pet_owners" DROP COLUMN "clerkUserId";

-- Step 10: Add unique constraint on userId
CREATE UNIQUE INDEX "pet_owners_userid_key" ON "pet_owners"("userId");

-- Step 11: Add index for query performance
CREATE INDEX "pet_owners_userid_idx" ON "pet_owners"("userId");

-- Step 12: Add NEW foreign key constraint to users.id
ALTER TABLE "pet_owners" 
ADD CONSTRAINT "pet_owners_userid_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================
-- PART C: Staff table migration
-- ============================================

-- Step 13: Add the new userId column to staff (nullable initially)
ALTER TABLE "staff" ADD COLUMN "userId" TEXT;

-- Step 14: Populate userId from the existing clerkUserId relationship
UPDATE "staff" s
SET "userId" = u."id"
FROM "users" u
WHERE s."clerkUserId" = u."clerkUserId";

-- Step 15: Verify all staff records were populated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "staff" WHERE "userId" IS NULL) THEN
    RAISE EXCEPTION 'Migration failed: Some staff have NULL userId after population. Check for orphaned records.';
  END IF;
END $$;

-- Step 16: Make userId NOT NULL after successful population
ALTER TABLE "staff" ALTER COLUMN "userId" SET NOT NULL;

-- Step 17: Drop the OLD foreign key constraint on clerkUserId
ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "staff_clerkUserId_fkey";

-- Step 18: Drop the OLD unique index on clerkUserId
DROP INDEX IF EXISTS "staff_clerkUserId_key";

-- Step 19: Drop the OLD clerkUserId column
ALTER TABLE "staff" DROP COLUMN "clerkUserId";

-- Step 20: Add unique constraint on userId
CREATE UNIQUE INDEX "staff_userid_key" ON "staff"("userId");

-- Step 21: Add index for query performance
CREATE INDEX "staff_userid_idx" ON "staff"("userId");

-- Step 22: Add NEW foreign key constraint to users.id
ALTER TABLE "staff" 
ADD CONSTRAINT "staff_userid_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;
