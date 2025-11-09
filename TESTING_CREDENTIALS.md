# 🧪 Testing Credentials

## 📱 **How to Test the App**

### **Sign Up / Sign In**
Use any **3-digit code** (e.g., `333`, `123`, `456`)

The app converts it to:
- **Email**: `{code}@test.hormoiq.com`
- **Password**: `test{code}123!`

### **Examples**
- Code `333` → `333@test.hormoiq.com` / `test333123!`
- Code `123` → `123@test.hormoiq.com` / `test123123!`
- Code `999` → `999@test.hormoiq.com` / `test999123!`

### **Testing Flow**
1. Open app
2. Tap "Sign Up"
3. Enter any 3-digit code (e.g., `333`)
4. Tap "Sign Up"
5. Success! Now you can sign in with the same code

---

## 🗄️ **New Supabase Project**

**Project ID**: `oayphmljxqiqvwddaknm`  
**Project URL**: `https://oayphmljxqiqvwddaknm.supabase.co`  
**Dashboard**: https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm

---

## ✅ **What's Deployed**

- ✅ **All database tables** (users, hormone_tests, etc.)
- ✅ **Edge Functions** (ask-ai, generate-questions)
- ✅ **OpenAI API key** (server-side)
- ✅ **Rate limiting** (100 requests/day/user)
- ✅ **Usage tracking** (ai_usage_logs table)

---

## 🧪 **Test Features**

### **1. Onboarding**
- Enter age, gender, hormone therapy status
- Should complete successfully

### **2. Log a Test**
- Navigate to TEST™
- Enter cortisol, testosterone, or DHEA value
- Add context (optional)
- Save test

### **3. View Scores**
- **READYSCORE™**: Requires 3 hormones tested today
- **BIOAGE™**: Requires 3+ tests across 2+ days
- **IMPACT™**: Requires 4+ tests across 7+ days

### **4. ASK™ AI Coach**
- Navigate to ASK™ tab
- Click a suggested question OR type your own
- AI should respond (via Edge Function)
- New suggested questions should appear

### **5. Track History**
- Navigate to Track tab
- View test history
- See charts and trends

---

## 📊 **Monitor Usage**

Check AI usage in Supabase SQL Editor:

```sql
-- View all AI requests
SELECT * FROM ai_usage_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- Today's usage
SELECT 
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(estimated_cost) as cost
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE;
```

---

## 🔐 **Security Note**

Your OpenAI API key is now **secure on the server** (Supabase Edge Functions).  
It's NOT in the app bundle anymore! ✅

---

**Last Updated**: November 9, 2025  
**Status**: Ready for Testing ✅

