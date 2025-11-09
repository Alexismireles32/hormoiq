# 🔧 Enable Email Signups in Supabase

## ⚠️ **ERROR: "Email signups are disabled"**

You need to enable email signups in Supabase dashboard.

---

## 📋 **Steps to Fix**

### **1. Go to Auth Providers**
https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/auth/providers

### **2. Enable Email Provider**
- Find **"Email"** in the providers list
- Make sure the toggle is **ON** (enabled)
- Click to configure if needed

### **3. Configure Email Settings**
Under Email provider settings:
- ✅ **Enable Email Provider**: ON
- ❌ **Confirm email**: OFF (for testing)
- ✅ **Enable sign ups**: ON (CRITICAL!)

### **4. Save Changes**
Click **"Save"** at the bottom

---

## ✅ **What You Need**

For testing to work:
1. ✅ Email provider: **ENABLED**
2. ✅ Enable sign ups: **ENABLED**
3. ❌ Confirm email: **DISABLED**

---

## 🧪 **After Enabling**

1. Wait 10 seconds for changes to propagate
2. Try signing up again with code `333`
3. Should work instantly! ✅

---

**Do this now and your auth will work!** 🚀

