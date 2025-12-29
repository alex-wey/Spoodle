-- AlterTable: Make phone column nullable to match Prisma schema
-- The database currently has a NOT NULL constraint that doesn't match the schema
-- This migration fixes the schema mismatch where the database has phone as NOT NULL
-- but Prisma schema defines it as nullable (String?)

-- Drop NOT NULL constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;
    END IF;
END $$;

