-- ============================================
-- COMPLETE DATABASE CLEANUP FOR TEST USERS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Show what will be deleted (review first)
SELECT 'USERS TABLE:' as table_name, id, email, onboarding_completed 
FROM users 
WHERE email LIKE '%@hormoiq.test';

-- Step 2: Delete from dependent tables first (if any data exists)
DELETE FROM hormone_tests WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

DELETE FROM user_protocols WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

DELETE FROM protocol_logs WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

-- Step 3: Delete from users table
DELETE FROM users WHERE email LIKE '%@hormoiq.test';

-- Step 4: Verify cleanup
SELECT COUNT(*) as remaining_test_users 
FROM users 
WHERE email LIKE '%@hormoiq.test';
-- Should return 0

-- ============================================
-- ALSO NEED TO CLEAN AUTH.USERS (Do this manually or with admin privileges)
-- ============================================
-- Unfortunately, Supabase doesn't allow direct DELETE on auth.users via SQL
-- You MUST go to: Authentication > Users in the Supabase Dashboard
-- And manually delete users with emails like: 332@hormoiq.test
-- ============================================

