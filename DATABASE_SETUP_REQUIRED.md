# 🗄️ DATABASE SETUP REQUIRED

## ⚠️ IMPORTANT: You need to run SQL migrations in Supabase

The app is showing errors because the `test_schedule_events` table doesn't exist in your Supabase database.

---

## 🚨 REQUIRED ACTION

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Complete Schema
1. Open the file: `supabase/schema.sql`
2. Copy the **ENTIRE contents** of that file
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd+Enter)

---

## ✅ What This Will Create

The schema will create/update these tables:

### Core Tables:
- ✅ `users` - User profiles and settings
- ✅ `hormone_tests` - Test results
- ✅ `ready_scores` - Daily readiness scores
- ✅ `bio_ages` - Biological age calculations
- ✅ `protocols` - Protocol library
- ✅ `user_protocols` - Active user protocols
- ✅ `protocol_logs` - Protocol compliance tracking
- ✅ `impact_analyses` - Intervention effectiveness
- ✅ `chat_messages` - AI chat history
- ✅ `user_patterns` - Pattern recognition data

### NEW Tables (From Recent Updates):
- ✅ `test_schedule_events` - **12-test kit scheduling** (MISSING - causes current errors)
- ✅ `ai_usage_logs` - AI usage tracking for rate limiting

### Security:
- ✅ Row Level Security (RLS) policies on all tables
- ✅ Proper indexes for performance
- ✅ Foreign key constraints

---

## 🔍 Current Errors Explained

### Error 1: "Could not find the table 'public.test_schedule_events'"
**Cause**: The test scheduling system (Phase 1) needs this table  
**Impact**: TestScheduleCard won't show kit progress  
**Solution**: Run the schema.sql in Supabase

### Error 2: ~~"DOMPurify.sanitize is not a function"~~
**Status**: ✅ FIXED in latest commit  
**Solution**: Replaced with React Native-compatible sanitization

---

## 📋 Verification Steps

After running the schema, verify it worked:

```sql
-- Run this in Supabase SQL Editor to verify:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('test_schedule_events', 'ai_usage_logs');
```

You should see both tables listed.

---

## ⚡ Quick Check

To see if you need to run migrations, check your Supabase dashboard:

1. Go to **Table Editor**
2. Look for `test_schedule_events` table
3. If it's missing → Run schema.sql
4. If it exists → You're good!

---

## 🆘 If You Get Errors

### "relation already exists"
This is OK! It means some tables already exist. The `IF NOT EXISTS` clauses will skip them.

### "permission denied"
Make sure you're running in the SQL Editor as the project owner, not as a restricted user.

### "syntax error"
Make sure you copied the ENTIRE schema.sql file, from start to finish.

---

## 📝 What to Expect

After running the schema successfully:
- ✅ TestScheduleCard will show kit progress (X/12 tests)
- ✅ Onboarding Step 4 will save schedule preferences
- ✅ No more "table not found" errors
- ✅ AI usage tracking will work
- ✅ All features fully functional

---

## 🎯 Next Steps After Database Setup

1. ✅ Run schema.sql in Supabase
2. ✅ Restart your Expo app (Ctrl+C, then `npm start`)
3. ✅ Test the onboarding flow
4. ✅ Verify TestScheduleCard shows on dashboard
5. ✅ Test AI chat (should work without DOMPurify errors)

---

**Current Status**: Database migration needed  
**Estimated Time**: 2-3 minutes  
**Difficulty**: Easy (copy & paste)

Once complete, all errors will be resolved! 🎉

