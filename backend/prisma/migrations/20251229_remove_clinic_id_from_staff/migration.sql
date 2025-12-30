-- Remove clinicId column from staff table
-- Staff clinics are now determined from the active Clerk organization, not stored in the database

-- Drop the foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'staff_clinicId_fkey'
        AND table_name = 'staff'
    ) THEN
        ALTER TABLE "staff" DROP CONSTRAINT "staff_clinicId_fkey";
    END IF;
END $$;

-- Drop the index on clinicId if it exists
DROP INDEX IF EXISTS "staff_clinicId_idx";

-- Drop the clinicId column
ALTER TABLE "staff" DROP COLUMN IF EXISTS "clinicId";

