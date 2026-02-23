-- Rollback script for migration
-- USE ONLY IF SOMETHING GOES WRONG
-- WARNING: This requires restoring clerkUserId data from backup!

-- ============================================
-- ROLLBACK PET_OWNERS
-- ============================================

-- Step 1: Drop the new foreign key constraint
ALTER TABLE "pet_owners" DROP CONSTRAINT IF EXISTS "pet_owners_userid_fkey";

-- Step 2: Drop the new indexes
DROP INDEX IF EXISTS "pet_owners_userid_key";
DROP INDEX IF EXISTS "pet_owners_userid_idx";

-- Step 3: Add back clerkUserId column
ALTER TABLE "pet_owners" ADD COLUMN "clerkUserId" TEXT;

-- Step 4: Populate clerkUserId from userId relationship
UPDATE "pet_owners" po
SET "clerkUserId" = u."clerkUserId"
FROM "users" u
WHERE po."userId" = u."id";

-- Step 5: Make clerkUserId NOT NULL and unique
ALTER TABLE "pet_owners" ALTER COLUMN "clerkUserId" SET NOT NULL;
CREATE UNIQUE INDEX "pet_owners_clerkUserId_key" ON "pet_owners"("clerkUserId");

-- Step 6: Add back old foreign key
ALTER TABLE "pet_owners" 
ADD CONSTRAINT "pet_owners_clerkUserId_fkey" 
FOREIGN KEY ("clerkUserId") REFERENCES "users"("clerkUserId") 
ON DELETE CASCADE;

-- Step 7: Drop userId column
ALTER TABLE "pet_owners" DROP COLUMN "userId";

-- ============================================
-- ROLLBACK STAFF
-- ============================================

-- Step 8: Drop the new foreign key constraint
ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "staff_userid_fkey";

-- Step 9: Drop the new indexes
DROP INDEX IF EXISTS "staff_userid_key";
DROP INDEX IF EXISTS "staff_userid_idx";

-- Step 10: Add back clerkUserId column
ALTER TABLE "staff" ADD COLUMN "clerkUserId" TEXT;

-- Step 11: Populate clerkUserId from userId relationship
UPDATE "staff" s
SET "clerkUserId" = u."clerkUserId"
FROM "users" u
WHERE s."userId" = u."id";

-- Step 12: Make clerkUserId NOT NULL and unique
ALTER TABLE "staff" ALTER COLUMN "clerkUserId" SET NOT NULL;
CREATE UNIQUE INDEX "staff_clerkUserId_key" ON "staff"("clerkUserId");

-- Step 13: Add back old foreign key
ALTER TABLE "staff" 
ADD CONSTRAINT "staff_clerkUserId_fkey" 
FOREIGN KEY ("clerkUserId") REFERENCES "users"("clerkUserId") 
ON DELETE CASCADE;

-- Step 14: Drop userId column
ALTER TABLE "staff" DROP COLUMN "userId";

-- ============================================
-- ROLLBACK USERS (OPTIONAL)
-- ============================================

-- Step 15: Make clerkUserId required again on users table
-- WARNING: This will fail if any users have NULL clerkUserId
-- ALTER TABLE "users" ALTER COLUMN "clerkUserId" SET NOT NULL;

-- Step 16: Remove imageUrl from users (optional, non-breaking to keep)
-- ALTER TABLE "users" DROP COLUMN IF EXISTS "imageUrl";

-- Note: After rollback, you'll need to update your application code
-- to use clerkUserId instead of userId for the PetOwner/Staff relationships
