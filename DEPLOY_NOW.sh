#!/bin/bash
# HormoIQ - Complete Supabase Deployment Script
# Run this to deploy Edge Functions and set up everything

set -e  # Exit on any error

echo "🚀 Starting HormoIQ Supabase Deployment..."
echo ""

# Project configuration
PROJECT_REF="oayphmljxqiqvwddaknm"

# Step 1: Link to Supabase project
echo "📡 Step 1/5: Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF

# Step 2: Push database migrations
echo "🗄️  Step 2/5: Applying database migrations..."
supabase db push

# Step 3: Set OpenAI API key
echo "🔑 Step 3/5: Setting OpenAI API key..."
read -p "Enter your OpenAI API key: " OPENAI_KEY
supabase secrets set OPENAI_API_KEY=$OPENAI_KEY

# Step 4: Deploy Edge Functions
echo "⚡ Step 4/5: Deploying Edge Functions..."
supabase functions deploy ask-ai
supabase functions deploy generate-questions

# Step 5: Test deployment
echo "🧪 Step 5/5: Testing deployment..."
supabase functions invoke ask-ai --data '{"messages":[{"role":"user","content":"Hello"}]}'

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with new credentials:"
echo "   EXPO_PUBLIC_SUPABASE_URL=https://oayphmljxqiqvwddaknm.supabase.co"
echo "   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heXBobWxqeHFpcXZ3ZGRha25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTU3NzIsImV4cCI6MjA3ODIzMTc3Mn0.G4jbhKa_Ugi0WLVMudYUQrWqRQHKDt8EHNxzCiqtg0A"
echo ""
echo "2. Remove EXPO_PUBLIC_OPENAI_API_KEY from .env (security!)"
echo ""
echo "3. Test your app: npx expo start --clear"
echo ""
echo "🎉 Your app is now secure and production-ready!"

