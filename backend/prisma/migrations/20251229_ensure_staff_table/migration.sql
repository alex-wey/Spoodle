-- Ensure staff table exists
-- This migration is idempotent - it will only create the table if it doesn't exist

-- Create staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS "staff" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "clinicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "staff_clerkUserId_key" ON "staff"("clerkUserId");
CREATE INDEX IF NOT EXISTS "staff_clinicId_idx" ON "staff"("clinicId");

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key to users table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'staff_clerkUserId_fkey'
    ) THEN
        ALTER TABLE "staff" 
        ADD CONSTRAINT "staff_clerkUserId_fkey" 
        FOREIGN KEY ("clerkUserId") 
        REFERENCES "users"("clerkUserId") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;

    -- Add foreign key to clinics table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'staff_clinicId_fkey'
    ) THEN
        ALTER TABLE "staff" 
        ADD CONSTRAINT "staff_clinicId_fkey" 
        FOREIGN KEY ("clinicId") 
        REFERENCES "clinics"("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

