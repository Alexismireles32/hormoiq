# 🧪 Supabase Integration Test Checklist

## ✅ **What We're Testing**

1. **Database Tables** - All tables exist and accessible
2. **Edge Functions** - AI functions deployed and working
3. **Authentication** - Sign up/sign in with 3-digit codes
4. **Row Level Security** - Data protection working
5. **Real-time Updates** - Live data sync

---

## 📋 **Test Plan**

### **1. Database Tables Check** ✅

Run this SQL in Supabase SQL Editor to verify all tables exist:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables**:
- ✅ `users`
- ✅ `hormone_tests`
- ✅ `ready_scores`
- ✅ `bio_ages`
- ✅ `protocols`
- ✅ `user_protocols`
- ✅ `protocol_logs`
- ✅ `impact_analyses`
- ✅ `chat_messages`
- ✅ `ai_usage_logs`

---

### **2. Edge Functions Check** ⚠️

Check if functions are deployed:

https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/functions

**Expected Functions**:
- ❓ `ask-ai` - AI chat completions
- ❓ `generate-questions` - Suggested questions

**Status**: May need deployment (we had CLI issues)

**Action if Missing**: Deploy manually via dashboard or run:
```bash
supabase functions deploy ask-ai
supabase functions deploy generate-questions
```

---

### **3. Authentication Test** 🎯

**Test Sign Up**:
1. Open app
2. Tap "Sign Up"
3. Enter: `333`
4. Should create account instantly ✅

**Test Sign In**:
1. Tap "Sign In"
2. Enter: `333`
3. Should log in ✅

**Verify in Supabase**:
https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/auth/users

Should see user: `user333@test-hormoiq.local`

---

### **4. Data Flow Test** 📊

**Test Onboarding**:
1. Sign up with code `444`
2. Complete onboarding (age, gender, hormone therapy)
3. Should redirect to dashboard

**Verify in Database**:
```sql
-- Check user profile was created
SELECT id, age, gender, onboarding_completed 
FROM users 
WHERE email = 'user444@test-hormoiq.local';
```

**Expected**: One row with your data ✅

---

### **5. Hormone Test Storage** 💉

**Test Adding Hormone Data**:
1. From dashboard, tap "Cortisol" or "Testosterone"
2. Enter a value
3. Save

**Verify in Database**:
```sql
-- Check hormone test was saved
SELECT * 
FROM hormone_tests 
ORDER BY tested_at DESC 
LIMIT 1;
```

**Expected**: Your test data with timestamp ✅

---

### **6. ReadyScore Calculation** 🎯

**Test ReadyScore**:
1. Add at least 1 hormone test today
2. Dashboard should show ReadyScore

**Verify in Database**:
```sql
-- Check ready score was calculated
SELECT * 
FROM ready_scores 
ORDER BY calculated_at DESC 
LIMIT 1;
```

**Expected**: Score between 0-100 ✅

---

### **7. BioAge Calculation** 🧬

**Test BioAge**:
1. Add 5+ tests over 3+ different days
2. BioAge card should unlock

**Verify in Database**:
```sql
-- Check bioage was calculated
SELECT * 
FROM bio_ages 
ORDER BY calculated_at DESC 
LIMIT 1;
```

**Expected**: Biological age within ±15 years of real age ✅

---

### **8. ASK™ AI Feature** 🤖

**Test AI Chat** (if Edge Functions deployed):
1. Go to ASK™ tab
2. Tap a starter question
3. Should get AI response

**Verify in Database**:
```sql
-- Check chat message was saved
SELECT * 
FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 2;
```

**Expected**: User message + AI response ✅

**Verify AI Usage Tracking**:
```sql
-- Check AI usage was logged
SELECT * 
FROM ai_usage_logs 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected**: Token counts and cost ✅

---

### **9. Row Level Security Test** 🔒

**Test Data Isolation**:
1. Sign up as user `555`
2. Add a hormone test
3. Sign out
4. Sign up as user `666`
5. Dashboard should be empty (can't see user 555's data)

**Verify**:
Users should only see their own data, not other users' data.

---

### **10. Protocols Feature** 📚

**Test Protocol Library**:
1. Go to Insights tab
2. Scroll to protocols
3. Should see 14 protocols

**Test Starting a Protocol**:
1. Tap a protocol
2. Tap "Start Protocol"
3. Should save to user_protocols

**Verify in Database**:
```sql
-- Check protocol was started
SELECT * 
FROM user_protocols 
WHERE status = 'active' 
ORDER BY started_at DESC 
LIMIT 1;
```

**Expected**: Your active protocol ✅

---

## 🚨 **Known Issues to Check**

### **Issue 1: Email Confirmation**
**Test**: Can you sign up instantly?
- ✅ YES → Email confirmation is disabled (good!)
- ❌ NO → Need to disable in: https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/auth/providers

### **Issue 2: Edge Functions Not Deployed**
**Test**: Does ASK™ feature work?
- ✅ YES → Functions deployed
- ❌ NO → Need to deploy (see section 2)

### **Issue 3: RLS Blocking Queries**
**Test**: Can you see your own data?
- ✅ YES → RLS working correctly
- ❌ NO → RLS may be too restrictive

### **Issue 4: Onboarding Loop**
**Test**: After onboarding, do you reach dashboard?
- ✅ YES → Navigation working
- ❌ NO → Check `onboarding_completed` flag

---

## 📊 **Quick Health Check SQL**

Run this to see overall system status:

```sql
-- System health check
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Total Tests',
  COUNT(*)
FROM hormone_tests
UNION ALL
SELECT 
  'Total Ready Scores',
  COUNT(*)
FROM ready_scores
UNION ALL
SELECT 
  'Total BioAges',
  COUNT(*)
FROM bio_ages
UNION ALL
SELECT 
  'Total AI Messages',
  COUNT(*)
FROM chat_messages
UNION ALL
SELECT 
  'Active Protocols',
  COUNT(*)
FROM user_protocols
WHERE status = 'active';
```

---

## ✅ **Success Criteria**

Your Supabase integration is **100% working** if:

1. ✅ All 10 tables exist
2. ✅ Sign up with 3-digit code works instantly
3. ✅ Onboarding saves data and redirects to dashboard
4. ✅ Hormone tests save to database
5. ✅ ReadyScore calculates after adding tests
6. ✅ BioAge unlocks after 5+ tests
7. ✅ Users can only see their own data (RLS working)
8. ✅ Protocols can be started and tracked
9. ✅ ASK™ AI chat works (if functions deployed)
10. ✅ No errors in console

---

## 🔧 **If Something Fails**

### **Authentication Issues**
→ See `DISABLE_EMAIL_CONFIRMATION.md`

### **Edge Function Issues**
→ See `SUPABASE_EDGE_FUNCTIONS.md`

### **Database Issues**
→ Run the complete schema SQL in Supabase dashboard

### **App Not Updating**
→ Clear Expo cache: `npx expo start --clear`

---

## 📝 **Test Results Template**

Copy this and fill it out:

```
## Test Results - [Date]

1. Database Tables: ✅/❌
2. Edge Functions: ✅/❌
3. Authentication: ✅/❌
4. Onboarding: ✅/❌
5. Hormone Tests: ✅/❌
6. ReadyScore: ✅/❌
7. BioAge: ✅/❌
8. ASK™ AI: ✅/❌
9. Row Level Security: ✅/❌
10. Protocols: ✅/❌

Overall Status: ✅/❌

Notes:
- [Any issues encountered]
- [How you fixed them]
```

---

**Run through this checklist to verify everything is working!** 🚀

