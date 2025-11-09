#!/bin/bash
# Quick script to check Supabase deployment status

echo "🔍 Checking Supabase Integration Status..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_REF="oayphmljxqiqvwddaknm"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heXBobWxqeHFpcXZ3ZGRha25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExNzYxNjQsImV4cCI6MjA0Njc1MjE2NH0.5vqGPR3p7X5zxdXD7jPaT6sJ3YkZ8sVHNH1YJH0Qo9I"

echo "📋 1. Checking Edge Functions..."
echo ""

# Check ask-ai function
echo "   Testing ask-ai function..."
ASK_AI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://${PROJECT_REF}.supabase.co/functions/v1/ask-ai" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$ASK_AI_RESPONSE" = "401" ] || [ "$ASK_AI_RESPONSE" = "400" ]; then
  echo -e "   ${GREEN}✅ ask-ai: DEPLOYED${NC} (got $ASK_AI_RESPONSE - expected)"
else
  echo -e "   ${RED}❌ ask-ai: NOT FOUND${NC} (got $ASK_AI_RESPONSE)"
fi

# Check generate-questions function
echo "   Testing generate-questions function..."
GEN_Q_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://${PROJECT_REF}.supabase.co/functions/v1/generate-questions" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$GEN_Q_RESPONSE" = "401" ] || [ "$GEN_Q_RESPONSE" = "400" ]; then
  echo -e "   ${GREEN}✅ generate-questions: DEPLOYED${NC} (got $GEN_Q_RESPONSE - expected)"
else
  echo -e "   ${RED}❌ generate-questions: NOT FOUND${NC} (got $GEN_Q_RESPONSE)"
fi

echo ""
echo "📊 2. Checking Database Connection..."
echo ""

# Check if we can reach Supabase
DB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://${PROJECT_REF}.supabase.co/rest/v1/users?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

if [ "$DB_RESPONSE" = "200" ] || [ "$DB_RESPONSE" = "401" ]; then
  echo -e "   ${GREEN}✅ Database: REACHABLE${NC}"
else
  echo -e "   ${RED}❌ Database: CONNECTION FAILED${NC} (got $DB_RESPONSE)"
fi

echo ""
echo "🔐 3. Checking Auth Settings..."
echo "   Visit: https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers"
echo -e "   ${YELLOW}⚠️  Ensure 'Confirm email' is DISABLED for testing${NC}"

echo ""
echo "📁 4. Local Files Status..."
echo ""

# Check if functions exist locally
if [ -d "supabase/functions/ask-ai" ]; then
  echo -e "   ${GREEN}✅ ask-ai function exists locally${NC}"
else
  echo -e "   ${RED}❌ ask-ai function missing locally${NC}"
fi

if [ -d "supabase/functions/generate-questions" ]; then
  echo -e "   ${GREEN}✅ generate-questions function exists locally${NC}"
else
  echo -e "   ${RED}❌ generate-questions function missing locally${NC}"
fi

# Check if migration exists
if [ -f "supabase/migrations/"*"add_ai_usage_logs.sql" ]; then
  echo -e "   ${GREEN}✅ AI usage logs migration exists${NC}"
else
  echo -e "   ${YELLOW}⚠️  AI usage logs migration not found${NC}"
fi

echo ""
echo "📝 5. Summary & Next Steps..."
echo ""

echo "   If Edge Functions are NOT deployed:"
echo "   → Option A: Deploy via CLI"
echo "     supabase functions deploy ask-ai"
echo "     supabase functions deploy generate-questions"
echo ""
echo "   → Option B: Deploy via Dashboard"
echo "     https://supabase.com/dashboard/project/${PROJECT_REF}/functions"
echo ""
echo "   If Database tables are missing:"
echo "   → Run complete schema SQL in SQL Editor"
echo "     https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""
echo "   If Auth not working:"
echo "   → Disable email confirmation"
echo "     https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers"
echo ""

echo "✅ Check complete! See TEST_SUPABASE.md for full testing guide."
echo ""

