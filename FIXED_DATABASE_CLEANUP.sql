-- ============================================
-- FIXED DATABASE CLEANUP FOR TEST USERS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Show what will be deleted (review first)
SELECT 'Test users to delete:' as info, id, email, onboarding_completed 
FROM users 
WHERE email LIKE '%@hormoiq.test';

-- Step 2: Delete from dependent tables (in correct order due to foreign keys)

-- Delete protocol logs (references user_protocols)
DELETE FROM protocol_logs 
WHERE user_protocol_id IN (
  SELECT id FROM user_protocols 
  WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
  )
);

-- Delete user protocols
DELETE FROM user_protocols 
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

-- Delete impact analyses
DELETE FROM impact_analyses 
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

-- Delete bio ages
DELETE FROM bio_ages 
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

-- Delete ready scores
DELETE FROM ready_scores 
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

-- Delete hormone tests
DELETE FROM hormone_tests 
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@hormoiq.test'
);

-- Step 3: Delete from users table (this should cascade to most things, but we did it manually above to be safe)
DELETE FROM users WHERE email LIKE '%@hormoiq.test';

-- Step 4: Verify cleanup
SELECT 
  'Remaining test users:' as info,
  COUNT(*) as count 
FROM users 
WHERE email LIKE '%@hormoiq.test';
-- Should return 0

-- ============================================
-- SUCCESS! ✅
-- Now you MUST also delete from Authentication > Users
-- in the Supabase Dashboard UI
-- ============================================

