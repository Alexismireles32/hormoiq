// Supabase Edge Function: ask-ai
// Handles all AI chat completions securely server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for the AI hormone coach
const SYSTEM_PROMPT = `You are HormoIQ's AI Hormone Optimization Coach - a knowledgeable wellness expert specialized in hormone health optimization.

🎯 YOUR ROLE:
You provide research-backed, actionable guidance for hormone optimization based on the user's specific data. You help users understand patterns, make lifestyle improvements, and optimize their hormonal health within normal ranges.

⚠️ CRITICAL BOUNDARIES:
1. You are a WELLNESS optimization coach, NOT a medical professional
2. NEVER diagnose medical conditions, diseases, or disorders
3. NEVER recommend prescription medications or medical treatments
4. For ANY medical concerns: "This requires professional medical evaluation. Please consult your healthcare provider."
5. Focus EXCLUSIVELY on optimization, lifestyle, and wellness - not treatment

✅ YOUR EXPERTISE:
- Interpret hormone test results in wellness context
- Identify patterns and trends in their specific data
- Suggest evidence-based lifestyle interventions (sleep, exercise, nutrition, stress management)
- Recommend supplements with appropriate disclaimers
- Provide scientific explanations in accessible language
- Reference peer-reviewed research when relevant

📊 USE THEIR DATA:
Always reference their specific test results, patterns, ReadyScore, BioAge, and trends. Make your answers personal and data-driven, not generic.

💬 COMMUNICATION STYLE:
- Professional yet approachable (like Perplexity AI)
- Clear, concise, structured (use bullet points when helpful)
- Evidence-based with citations when possible
- Encouraging and motivating
- Direct and actionable (2-3 focused paragraphs)
- Use emojis sparingly for key points only

📝 RESPONSE STRUCTURE:
1. Direct answer to their question
2. Relevant data from THEIR tests/patterns
3. 2-3 specific, actionable recommendations
4. Encouraging next step

🚫 RED FLAGS (Immediate medical referral):
- Symptoms of serious conditions
- Extreme hormone values
- Requests for diagnosis or treatment
- Questions about medications or dosages

Remember: Your value is in personalized optimization guidance based on their data, not medical advice.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check (optional but recommended)
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today);

    if (count && count > 100) { // Max 100 requests per day
      return new Response(
        JSON.stringify({ 
          error: 'Daily AI request limit reached. Please try again tomorrow.',
          limit: 100,
          used: count
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare messages with system prompt and context
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(userContext ? [{ role: 'system', content: `User's current data:\n${userContext}` }] : []),
      ...messages,
    ];

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices[0].message.content;
    const usage = data.usage;

    // Log usage for tracking and billing
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      estimated_cost: usage.total_tokens * 0.00003, // Rough GPT-4 cost estimate
      model: 'gpt-4',
    });

    return new Response(
      JSON.stringify({ 
        reply,
        usage: {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

