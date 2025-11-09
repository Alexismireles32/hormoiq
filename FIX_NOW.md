# 🔥 IMMEDIATE FIX - Follow These Steps

## ⚠️ The Problem
You have **old test users in the database** that are conflicting with new sign-ups.

---

## ✅ **STEP 1: Clean Up Database** (REQUIRED)

### Go to Supabase Dashboard:
1. Open [https://wydfkooapfnxbrcgkbmk.supabase.co](https://wydfkooapfnxbrcgkbmk.supabase.co)
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**
4. Paste this SQL:

```sql
-- Delete all test users from users table
DELETE FROM users WHERE email LIKE '%@hormoiq.test';

-- Verify it's clean
SELECT email FROM users WHERE email LIKE '%@hormoiq.test';
```

5. Click **"RUN"**
6. Should show: **"0 rows"** ✅

### Also Clean Auth Users:
1. Click **"Authentication"** in left sidebar
2. Click **"Users"**
3. Find any users with emails like `332@hormoiq.test`
4. Click **"..."** → **"Delete user"**
5. Repeat for all test users

---

## ✅ **STEP 2: Reload App**

In your Expo terminal:
1. Press **`r`** to reload

---

## ✅ **STEP 3: Test Fresh Sign Up**

Now try this flow:

```
1. App loads → Should show "Sign In" screen ✅
2. Tap "Sign Up"
3. Enter: 555 (new code, not 332)
4. Tap "Sign Up"
5. Should see "Success! Your code 555 is registered!" ✅
6. Tap "OK"
7. Enter: 555
8. Tap "Sign In"
9. Should go to onboarding (3 questions) ✅
10. Answer questions
11. Tap "Complete"
12. Should go to main app! 🎉
```

---

## 🔍 **Watch Console For**

You should see:
```
Inserting new user...
Onboarding successful!
```

---

## ❌ **If Still Getting Errors**

### Error: "duplicate key value"
→ You didn't clean the database properly. Repeat STEP 1.

### Error: Goes straight to onboarding
→ That's expected! You have a session but haven't completed onboarding yet.
→ Just complete the 3 questions and you're in!

### Can't see Sign In screen
→ There's an old session. Clear it:

**Option A: Sign Out**
- Go to Profile tab (if you can)
- Tap "Sign Out"

**Option B: Clear Expo Cache**
```bash
# In terminal, stop expo (Ctrl+C)
npx expo start --clear --reset-cache
```

---

## 🎯 **Expected Flow (No Database Conflicts)**

### For NEW User (code 555):
```
Launch → Sign In screen
         ↓
Tap Sign Up → Enter 555 → Success message
         ↓
Tap Sign In → Enter 555 → Onboarding (3 questions)
         ↓
Complete → Main App ✅
```

### For EXISTING User (already signed up with 555):
```
Launch → Sign In screen
         ↓
Enter 555 → Tap Sign In → Main App directly ✅
(skips onboarding because already completed)
```

---

## 🧪 **Multiple Test Accounts**

You can create multiple:
- Code `111` for testing cortisol tracking
- Code `222` for testing testosterone
- Code `333` for testing full BioAge flow
- Code `444` for testing protocols

Each code is completely separate!

---

## 🆘 **Still Stuck?**

Share:
1. What you see in the console (all the logs)
2. What screen you're on
3. What happens when you tap buttons

---

**Start with STEP 1 (clean database) - that's the root cause!** 🚀

