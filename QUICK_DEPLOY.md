# ⚡ QUICK DEPLOYMENT - Supabase Edge Functions

## 🚨 **IMPORTANT: DO THIS BEFORE PUBLIC LAUNCH**

Your OpenAI API key must be moved server-side to prevent abuse and unauthorized usage.

---

## 📋 **5-MINUTE SETUP**

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
# OR
npm install -g supabase
```

### 2. Login & Link
```bash
supabase login
cd /Users/alexismireles/Documents/hormoiq/hormoiq
supabase link --project-ref wydfkooapfnxbrcgkbmk
```

### 3. Run Database Migration
```bash
supabase db push
```
This creates the `ai_usage_logs` table for tracking.

### 4. Set OpenAI API Key (Server-Side)
```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```
⚠️ **Use your actual OpenAI API key here!**

### 5. Deploy Functions
```bash
supabase functions deploy
```
This deploys both `ask-ai` and `generate-questions` functions.

### 6. Test
```bash
supabase functions invoke ask-ai \
  --data '{"messages":[{"role":"user","content":"Hello"}]}'
```
Should return an AI response.

### 7. Update Client .env
Remove the OpenAI API key from your `.env` file:
```bash
# REMOVE THIS LINE:
# EXPO_PUBLIC_OPENAI_API_KEY=sk-...

# Keep these:
EXPO_PUBLIC_SUPABASE_URL=https://wydfkooapfnxbrcgkbmk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 8. Test App
```bash
npx expo start --clear
```
Navigate to ASK™ and verify it works.

---

## ✅ **VERIFICATION**

After deployment, check:
- [ ] Functions show as "deployed" in Supabase dashboard
- [ ] ASK™ feature works in the app
- [ ] Suggested questions appear
- [ ] Usage logs appear in `ai_usage_logs` table
- [ ] No OpenAI API key in client code

---

## 📊 **Monitor Usage**

Check your usage in Supabase SQL Editor:
```sql
SELECT 
  COUNT(*) as requests_today,
  SUM(total_tokens) as tokens,
  SUM(estimated_cost) as cost
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE;
```

---

## 🔧 **Troubleshooting**

**"OpenAI API key not configured"**
→ Run: `supabase secrets set OPENAI_API_KEY=your_key`

**"Function not found"**
→ Run: `supabase functions deploy`

**"Unauthorized"**
→ Make sure user is logged in to the app

---

## 📚 **Full Documentation**

See `SUPABASE_EDGE_FUNCTIONS.md` for:
- Detailed setup instructions
- Monitoring & analytics
- Cost optimization
- Scaling considerations
- Emergency procedures

---

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Required**: OpenAI API key  
**Status**: Ready to deploy ✅

