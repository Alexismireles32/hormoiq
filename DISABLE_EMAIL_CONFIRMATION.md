# 🔧 Disable Email Confirmation for Testing

## ⚠️ **CRITICAL STEP**

For testing with simple 3-digit codes, you MUST disable email confirmation in Supabase.

---

## 📋 **Steps**

### 1. Go to Supabase Auth Settings
https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/auth/providers

### 2. Click on "Email" Provider

### 3. Disable "Confirm email"
- Find the toggle for **"Confirm email"**
- **Turn it OFF** (disabled)

### 4. Click "Save"

---

## ✅ **What This Does**

- Users can sign up without email verification
- Test accounts work immediately
- No need to check email for confirmation links

---

## 🔒 **Security Note**

This is **ONLY for testing**. Before production:
1. Re-enable email confirmation
2. Set up proper authentication (Shopify orders)
3. Remove test account system

---

## 🧪 **After Disabling**

Your test authentication will work:
- User enters: `333`
- App creates: `user333@test-hormoiq.local`
- Account created instantly ✅
- No email confirmation needed ✅

---

**Do this now to make testing work!** 🚀

