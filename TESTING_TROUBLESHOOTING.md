# 🔧 Testing Troubleshooting Guide

## 🚨 Issue: "Record Already Exists" Error

### What's Happening
The onboarding is showing an error when trying to complete. This helps us debug it.

---

## ✅ Steps to Fix

### 1. **Clear All Cache**
In your Expo terminal:
```bash
# Press: Shift + C (to clear cache)
# Or stop and run:
npx expo start --clear
```

### 2. **Reset Your Test Account**

Go to your Supabase Dashboard:
1. Open **Authentication** → **Users**
2. Find user with email like `332@hormoiq.test`
3. **Delete** that user
4. Go to **Table Editor** → **users** table
5. Find row with that email
6. **Delete** that row too

### 3. **Try Fresh Sign Up**
1. Launch app (should show Sign In screen)
2. Tap **"Sign Up"**
3. Enter a NEW code (e.g., `555` instead of `332`)
4. Complete onboarding
5. Check the Metro/Expo console for any errors

---

## 🔍 Debugging Steps

### Check Console Logs
When you complete onboarding, watch the Metro terminal for:
- ✅ `Onboarding successful:` → It worked!
- ❌ `Onboarding upsert error:` → Shows exact error
- ❌ `Onboarding catch error:` → Shows caught error

### Common Issues

**1. Duplicate Email**
```
Error: duplicate key value violates unique constraint
```
**Fix**: Delete the existing user in Supabase

**2. Missing Columns**
```
Error: column "xyz" does not exist
```
**Fix**: Run the schema update in Supabase SQL Editor

**3. RLS Policy Blocking**
```
Error: new row violates row-level security policy
```
**Fix**: Check RLS policies in Supabase

---

## 🧪 Test Different Scenarios

### Scenario 1: Fresh User
```
1. Pick unused code (e.g., 777)
2. Sign up
3. Complete onboarding
4. Should work perfectly ✅
```

### Scenario 2: Existing User
```
1. Sign out
2. Sign in with same code (777)
3. Should go directly to app ✅
```

### Scenario 3: Multiple Accounts
```
1. Test with: 111, 222, 333, 444
2. Each should be separate
3. Each should maintain their own data
```

---

## 📱 Current Flow

```
App Launch
    ↓
No Session? → Sign In Screen
    ↓
Sign Up / Sign In with 3-digit code
    ↓
Session Created → Check Profile
    ↓
No Onboarding? → Onboarding Screen
    ↓
Complete Onboarding → Main App
```

---

## 🆘 Still Having Issues?

### Check These:

1. **Expo Cache Cleared?**
   - Press `Shift + C` in terminal
   - Or restart with `--clear`

2. **Supabase Updated?**
   - Run all schema updates
   - Check users table has required columns

3. **Console Errors?**
   - Watch Metro terminal
   - Share any red errors you see

4. **Auth Working?**
   - Can you reach sign-in screen?
   - Can you create new code?

---

## 💡 Quick Reset Everything

```bash
# In Supabase SQL Editor:
DELETE FROM users WHERE email LIKE '%@hormoiq.test';

# Then in your app terminal:
# Press: Shift + C (clear cache)
# Press: r (reload)
```

This wipes all test accounts and starts fresh!

---

**Let me know what you see in the console and we'll fix it!** 🚀

