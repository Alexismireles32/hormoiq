-- ============================================
-- CLEANUP TEST USERS
-- Run this in Supabase SQL Editor to remove all test accounts
-- ============================================

-- Delete from users table (will cascade to related data)
DELETE FROM users WHERE email LIKE '%@hormoiq.test';

-- Also delete from auth.users (Supabase auth table)
-- Note: You may need to do this manually in the Auth UI
-- Go to Authentication > Users and delete users with @hormoiq.test emails

-- Verify cleanup
SELECT email FROM users WHERE email LIKE '%@hormoiq.test';
-- Should return 0 rows

SELECT email FROM auth.users WHERE email LIKE '%@hormoiq.test';
-- Should return 0 rows

