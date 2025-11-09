# 🗄️ Database Migration Guide

## IMPORTANT: Run These SQL Commands in Supabase

Before using the new onboarding, you MUST add the new database fields.

---

## 🚨 Required Migration (Run This Now!)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `wydfkooapfnxbrcgkbmk`
3. Click **SQL Editor** in the left sidebar

### Step 2: Run This SQL

```sql
-- Add hormone therapy tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS on_hormone_therapy BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hormone_therapy_unknown BOOLEAN DEFAULT false;

-- Verify fields were added
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('on_hormone_therapy', 'hormone_therapy_unknown');
```

### Step 3: Verify Success

You should see output like:
```
column_name              | data_type | column_default
-------------------------+-----------+----------------
on_hormone_therapy       | boolean   | false
hormone_therapy_unknown  | boolean   | false
```

---

## ✅ What These Fields Do

| Field | Type | Purpose |
|-------|------|---------|
| `on_hormone_therapy` | boolean | User confirmed they ARE taking HRT/TRT/BC |
| `hormone_therapy_unknown` | boolean | User selected "Not Sure" about therapy status |

### Why This Matters
People on hormone therapy have **completely different** hormone ranges. For example:
- **TRT users** may have testosterone 800-1200 ng/dL (normal is 300-1000)
- **Birth control users** may have suppressed hormones (by design)
- **HRT users** may have elevated specific hormones (intended)

Without this data, the app would incorrectly flag these as "abnormal" results.

---

## 🔒 Security Note

These fields respect Row Level Security (RLS):
- ✅ Only the user can see their own data
- ✅ Admin can view if needed
- ✅ Cannot be modified by other users

---

## 🧪 Testing After Migration

### Test 1: Complete Onboarding
1. Sign out of the app
2. Start fresh (anonymous or new account)
3. Complete the 3 onboarding questions
4. Check Supabase → users table
5. Verify the new fields are populated

### Test 2: Check Existing Users
Run this query to see existing user data:
```sql
SELECT 
  id,
  email,
  age,
  gender,
  on_hormone_therapy,
  hormone_therapy_unknown,
  onboarding_completed
FROM users
LIMIT 10;
```

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can remove these fields:

```sql
-- WARNING: This will delete the data in these columns!
ALTER TABLE users DROP COLUMN IF EXISTS on_hormone_therapy;
ALTER TABLE users DROP COLUMN IF EXISTS hormone_therapy_unknown;
```

---

## 📊 Migration Status

- [ ] SQL executed in Supabase
- [ ] Verification query run
- [ ] Fields confirmed in users table
- [ ] Test onboarding completed
- [ ] Data saving correctly

---

## 🆘 Troubleshooting

### Error: "column already exists"
✅ **This is fine!** It means the field was already added. The migration is idempotent.

### Error: "permission denied"
❌ Make sure you're logged in as the project owner in Supabase.

### Fields not showing data
1. Complete a fresh onboarding
2. Check the users table again
3. Verify the user ID matches
4. Check browser console for errors

---

## ✅ You're Done!

Once you've run the SQL and verified the fields exist, your app is ready to use the new onboarding system!

**Next:** Test the app with `npm start` and scan the QR code.

