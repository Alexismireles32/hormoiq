# 🚀 HormoIQ - New Supabase Project Setup

## 📋 **NEW PROJECT CREDENTIALS**

**Project ID**: `oayphmljxqiqvwddaknm`  
**Project URL**: `https://oayphmljxqiqvwddaknm.supabase.co`  
**Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heXBobWxqeHFpcXZ3ZGRha25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTU3NzIsImV4cCI6MjA3ODIzMTc3Mn0.G4jbhKa_Ugi0WLVMudYUQrWqRQHKDt8EHNxzCiqtg0A`

---

## ⚡ **OPTION 1: Automated Script (Recommended)**

Run this single command:

```bash
cd /Users/alexismireles/Documents/hormoiq/hormoiq && ./DEPLOY_NOW.sh
```

The script will:
1. Link to your Supabase project
2. Apply database migrations
3. Ask for your OpenAI API key and set it
4. Deploy both Edge Functions
5. Test the deployment

**You'll be prompted for**:
- Your OpenAI API key when needed

---

## ⚡ **OPTION 2: Manual Commands (Copy & Paste All)**

Copy and paste this entire block into your terminal:

```bash
# Navigate to project
cd /Users/alexismireles/Documents/hormoiq/hormoiq

# Link to new Supabase project
supabase link --project-ref oayphmljxqiqvwddaknm

# Apply database migrations (creates ai_usage_logs table)
supabase db push

# Set your OpenAI API key (REPLACE WITH YOUR ACTUAL KEY!)
supabase secrets set OPENAI_API_KEY=your_actual_openai_key_here

# Deploy Edge Functions
supabase functions deploy ask-ai
supabase functions deploy generate-questions

# Test the deployment
supabase functions invoke ask-ai --data '{"messages":[{"role":"user","content":"Hello"}]}'

echo "✅ Deployment complete!"
```

**IMPORTANT**: Replace `your_actual_openai_key_here` with your real OpenAI API key!

---

## 📝 **STEP 3: Update Your .env File**

Edit `/Users/alexismireles/Documents/hormoiq/hormoiq/.env`:

```bash
# NEW Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://oayphmljxqiqvwddaknm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heXBobWxqeHFpcXZ3ZGRha25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTU3NzIsImV4cCI6MjA3ODIzMTc3Mn0.G4jbhKa_Ugi0WLVMudYUQrWqRQHKDt8EHNxzCiqtg0A

# REMOVE THIS LINE (API key now on server):
# EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

---

## 🧪 **STEP 4: Test Your App**

```bash
cd /Users/alexismireles/Documents/hormoiq/hormoiq

# Clear cache and start
npx expo start --clear
```

Then:
1. Scan QR code or press 'i' for iOS simulator
2. Register with a test code (e.g., 123)
3. Navigate to ASK™ tab
4. Try asking a question
5. Verify suggested questions appear

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify:

- [ ] Edge Functions show as "deployed" in Supabase dashboard:
  - https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/functions

- [ ] Database table `ai_usage_logs` exists:
  - https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/editor

- [ ] OpenAI API key is set in secrets (check):
  ```bash
  supabase secrets list --project-ref oayphmljxqiqvwddaknm
  ```

- [ ] Test Edge Function works:
  ```bash
  supabase functions invoke ask-ai --data '{"messages":[{"role":"user","content":"Test"}]}'
  ```

- [ ] App connects and ASK™ feature works

- [ ] Usage logs appear in `ai_usage_logs` table after asking questions

---

## 🔧 **TROUBLESHOOTING**

### "Cannot link to project"
**Solution**: Make sure you're logged in with the account that owns the new project:
```bash
supabase logout
supabase login
supabase link --project-ref oayphmljxqiqvwddaknm
```

### "OpenAI API key not configured"
**Solution**: Set it again:
```bash
supabase secrets set OPENAI_API_KEY=your_key_here --project-ref oayphmljxqiqvwddaknm
```

### "Function not found"
**Solution**: Redeploy:
```bash
supabase functions deploy --project-ref oayphmljxqiqvwddaknm
```

### App shows "Invalid API key" or "Unauthorized"
**Solution**: 
1. Check your `.env` file has the new credentials
2. Restart Expo: `npx expo start --clear`
3. Make sure you're logged into the app

---

## 📊 **MONITOR USAGE**

Check your AI usage in Supabase SQL Editor:

```sql
-- View all AI requests
SELECT * FROM ai_usage_logs
ORDER BY created_at DESC
LIMIT 50;

-- Today's usage
SELECT 
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(estimated_cost) as cost
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE;
```

Go to: https://supabase.com/dashboard/project/oayphmljxqiqvwddaknm/editor

---

## 🎯 **WHAT WAS DEPLOYED**

### Edge Functions
1. **ask-ai** - Handles all AI chat completions securely
2. **generate-questions** - Generates suggested follow-up questions

### Database
- **ai_usage_logs** table - Tracks all AI API usage
- **daily_ai_usage** view - Daily aggregated statistics
- RLS policies for secure access

### Security
- ✅ OpenAI API key now server-side only
- ✅ Rate limiting: 100 requests/day per user
- ✅ Usage tracking and cost monitoring
- ✅ Abuse prevention

---

## 💰 **COST EXPECTATIONS**

With the new setup:
- **Supabase**: FREE (up to 500K function invocations/month)
- **OpenAI**: ~$0.015 per conversation
- **Total for 100 users**: ~$75/month (OpenAI only)

Rate limiting ensures costs stay predictable!

---

## 🚀 **YOU'RE READY!**

After running the deployment:
1. ✅ Your OpenAI API key is secure (server-side)
2. ✅ Edge Functions are deployed and working
3. ✅ Usage tracking is enabled
4. ✅ Rate limiting protects against abuse
5. ✅ App is production-ready!

**Run the deployment now**: `./DEPLOY_NOW.sh`

---

**Last Updated**: November 9, 2025  
**New Project**: oayphmljxqiqvwddaknm  
**Status**: Ready to Deploy ✅

