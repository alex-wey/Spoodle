-- Migration: Replace clerkUserId with userId in pet_owners and staff
-- This migration replaces the old clerkUserId FK with userId FK to users.id
-- Fully idempotent - safe to run on databases in any state

-- ============================================
-- PART A: Users table changes
-- ============================================

-- Add imageUrl to users table (non-breaking)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Make users.clerkUserId nullable (non-breaking) - only if column exists and is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'clerkUserId' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "users" ALTER COLUMN "clerkUserId" DROP NOT NULL;
  END IF;
END $$;

-- ============================================
-- PART B: PetOwners table migration
-- ============================================

-- Add the new userId column if it doesn't exist
ALTER TABLE "pet_owners" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Populate userId from the existing clerkUserId relationship (only if clerkUserId column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pet_owners' AND column_name = 'clerkUserId'
  ) THEN
    UPDATE "pet_owners" po
    SET "userId" = u."id"
    FROM "users" u
    WHERE po."clerkUserId" = u."clerkUserId"
    AND po."userId" IS NULL;
    
    -- Verify all pet_owners records were populated
    IF EXISTS (SELECT 1 FROM "pet_owners" WHERE "userId" IS NULL) THEN
      RAISE EXCEPTION 'Migration failed: Some pet_owners have NULL userId after population.';
    END IF;
  END IF;
END $$;

-- Make userId NOT NULL after successful population (only if not already NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pet_owners' AND column_name = 'userId' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "pet_owners" ALTER COLUMN "userId" SET NOT NULL;
  END IF;
END $$;

-- Drop the OLD foreign key constraint on clerkUserId
ALTER TABLE "pet_owners" DROP CONSTRAINT IF EXISTS "pet_owners_clerkUserId_fkey";

-- Drop the OLD unique index on clerkUserId
DROP INDEX IF EXISTS "pet_owners_clerkUserId_key";

-- Drop the OLD clerkUserId column if it exists
ALTER TABLE "pet_owners" DROP COLUMN IF EXISTS "clerkUserId";

-- Add unique constraint on userId (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "pet_owners_userid_key" ON "pet_owners"("userId");

-- Add index for query performance (if not exists)
CREATE INDEX IF NOT EXISTS "pet_owners_userid_idx" ON "pet_owners"("userId");

-- Add NEW foreign key constraint to users.id (drop first if exists to avoid duplicates)
ALTER TABLE "pet_owners" DROP CONSTRAINT IF EXISTS "pet_owners_userid_fkey";
ALTER TABLE "pet_owners" 
ADD CONSTRAINT "pet_owners_userid_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================
-- PART C: Staff table migration
-- ============================================

-- Add the new userId column if it doesn't exist
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Populate userId from the existing clerkUserId relationship (only if clerkUserId column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'clerkUserId'
  ) THEN
    UPDATE "staff" s
    SET "userId" = u."id"
    FROM "users" u
    WHERE s."clerkUserId" = u."clerkUserId"
    AND s."userId" IS NULL;
    
    -- Verify all staff records were populated
    IF EXISTS (SELECT 1 FROM "staff" WHERE "userId" IS NULL) THEN
      RAISE EXCEPTION 'Migration failed: Some staff have NULL userId after population.';
    END IF;
  END IF;
END $$;

-- Make userId NOT NULL after successful population (only if not already NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'userId' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "staff" ALTER COLUMN "userId" SET NOT NULL;
  END IF;
END $$;

-- Drop the OLD foreign key constraint on clerkUserId
ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "staff_clerkUserId_fkey";

-- Drop the OLD unique index on clerkUserId
DROP INDEX IF EXISTS "staff_clerkUserId_key";

-- Drop the OLD clerkUserId column if it exists
ALTER TABLE "staff" DROP COLUMN IF EXISTS "clerkUserId";

-- Add unique constraint on userId (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "staff_userid_key" ON "staff"("userId");

-- Add index for query performance (if not exists)
CREATE INDEX IF NOT EXISTS "staff_userid_idx" ON "staff"("userId");

-- Add NEW foreign key constraint to users.id (drop first if exists to avoid duplicates)
ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "staff_userid_fkey";
ALTER TABLE "staff" 
ADD CONSTRAINT "staff_userid_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;
