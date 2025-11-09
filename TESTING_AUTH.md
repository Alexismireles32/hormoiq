# 🔐 TESTING AUTH - Simple 3-Digit Code Login

> **⚠️ TESTING ONLY**: This is a simplified authentication system for development and testing. Will be replaced with Shopify email + order number login in production.

---

## 📱 How It Works

### Sign Up (Create New Code)
1. Open the app
2. Tap "Sign Up"
3. Enter any **3-digit code** (e.g., `332`, `123`, `999`)
4. Tap "Sign Up"
5. Success! Your code is registered

### Sign In (Use Existing Code)
1. Tap "Sign In"
2. Enter your **3-digit code**
3. Tap "Sign In"
4. You're in!

---

## 🔧 Technical Details

### How Codes Are Stored
- **Format**: `{code}@hormoiq.test`
- **Example**: Code `332` becomes `332@hormoiq.test`
- **Password**: Auto-generated as `test{code}`

### What Gets Saved
- All your hormone tests
- ReadyScore™ history
- BioAge™ data
- Onboarding information
- Protocol tracking
- Everything is tied to your 3-digit code!

### Database
- Stored in Supabase Auth
- Full user profile in `users` table
- All sessions maintained properly

---

## 🚀 Testing Examples

```
Code 332 → Email: 332@hormoiq.test
Code 123 → Email: 123@hormoiq.test
Code 999 → Email: 999@hormoiq.test
```

---

## 🔮 Future Implementation

This will be replaced with:
- **Shopify Email**: User's purchase email
- **Order Number**: From physical hormone strip purchase
- **Secure Login**: Verified against Shopify orders

---

## ✅ Benefits for Testing

1. **Super Fast**: No typing long emails/passwords
2. **Easy to Remember**: Just 3 digits
3. **Quick Switching**: Test multiple accounts easily
4. **Full Features**: All app functionality works
5. **Real Sessions**: Proper auth flow maintained

---

## 🎯 Quick Start

1. Launch app
2. Tap "Sign Up"
3. Enter `332`
4. Complete onboarding
5. Start testing!

---

**Ready to test! 🧪**

