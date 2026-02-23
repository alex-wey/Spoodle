-- Verification queries to run after migration
-- Run these manually to confirm the migration succeeded

-- ============================================
-- PET_OWNERS VERIFICATION
-- ============================================

-- 1. Check no pet_owners have NULL userId
SELECT 'pet_owners with NULL userId' as check_name, COUNT(*) as count 
FROM pet_owners WHERE "userId" IS NULL;
-- Expected: 0

-- 2. Check all pet_owners have a valid user reference
SELECT 'pet_owners with invalid userId reference' as check_name, COUNT(*) as count
FROM pet_owners po
LEFT JOIN users u ON po."userId" = u.id
WHERE u.id IS NULL;
-- Expected: 0

-- 3. Verify clerkUserId column was removed
SELECT 'pet_owners clerkUserId column exists' as check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pet_owners' AND column_name = 'clerkUserId'
  ) THEN 'YES - ERROR' ELSE 'NO - OK' END as status;
-- Expected: NO - OK

-- ============================================
-- STAFF VERIFICATION
-- ============================================

-- 4. Check no staff have NULL userId
SELECT 'staff with NULL userId' as check_name, COUNT(*) as count 
FROM staff WHERE "userId" IS NULL;
-- Expected: 0

-- 5. Check all staff have a valid user reference
SELECT 'staff with invalid userId reference' as check_name, COUNT(*) as count
FROM staff s
LEFT JOIN users u ON s."userId" = u.id
WHERE u.id IS NULL;
-- Expected: 0

-- 6. Verify clerkUserId column was removed
SELECT 'staff clerkUserId column exists' as check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'clerkUserId'
  ) THEN 'YES - ERROR' ELSE 'NO - OK' END as status;
-- Expected: NO - OK

-- ============================================
-- SUMMARY
-- ============================================

-- 7. Summary counts
SELECT 'total pet_owners' as metric, COUNT(*) as count FROM pet_owners
UNION ALL
SELECT 'total staff' as metric, COUNT(*) as count FROM staff
UNION ALL
SELECT 'total users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 'users with clerkUserId (linked to Clerk)' as metric, COUNT(*) as count 
FROM users WHERE "clerkUserId" IS NOT NULL
UNION ALL
SELECT 'users without clerkUserId (placeholder)' as metric, COUNT(*) as count 
FROM users WHERE "clerkUserId" IS NULL;
