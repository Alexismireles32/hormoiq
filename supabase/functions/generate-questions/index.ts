// Supabase Edge Function: generate-questions
// Generates contextual follow-up questions securely server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUESTION_GENERATION_PROMPT = `You are a suggestion generator for HormoIQ, a hormone optimization app. Your job is to predict what the USER would most likely want to ask NEXT as a follow-up.

CRITICAL: Generate questions that the USER would ASK the AI coach, NOT questions the AI would ask the user.

✅ GOOD EXAMPLES (user asking AI):
- "What habits help lower cortisol naturally?"
- "How does sleep affect testosterone levels?"
- "What supplements support DHEA production?"
- "When is the best time to test cortisol?"
- "How can I improve my ReadyScore?"

❌ BAD EXAMPLES (AI asking user - DON'T DO THIS):
- "What symptoms are you experiencing?"
- "Have you had a recent blood test?"
- "Are you taking any medications?"

GUIDELINES:
1. Base suggestions on the conversation topic they just discussed
2. Make them actionable and specific to hormone optimization
3. Consider their personal data (test results, patterns, scores)
4. Keep questions concise (5-10 words max)
5. Make them feel like natural follow-up questions
6. Focus on HOW/WHAT/WHY questions about optimization

Format: Return ONLY 3 questions, one per line, no numbering, no extra text, no punctuation at the end.`;

// Fallback questions if AI generation fails
const FALLBACK_QUESTIONS = [
  'What habits help lower cortisol naturally',
  'How does sleep quality affect testosterone',
  'What supplements support healthy DHEA levels',
  'When is the best time to test hormones',
  'How can I improve my ReadyScore',
  'What foods boost testosterone naturally',
  'How does stress impact hormone balance',
  'What exercise helps optimize hormones',
  'How much sleep do I need for hormones',
  'What are signs of hormone imbalance',
  'How can I track my progress effectively',
  'What lifestyle changes improve BioAge',
];

function getRandomQuestions(count: number = 3): string[] {
  const shuffled = [...FALLBACK_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

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
    const { conversationContext, userData, isStarter } = await req.json();

    // If this is a starter request (no conversation yet), return starter questions
    if (isStarter) {
      const starterQuestions = userData?.testsCount && userData.testsCount > 0
        ? [
            'What do my recent test results mean',
            'How can I improve my hormone balance',
            'What habits would optimize my scores',
          ]
        : [
            'How do I get started with testing',
            'What hormones should I track first',
            'What lifestyle factors affect hormones most',
          ];
      
      return new Response(
        JSON.stringify({ questions: starterQuestions }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      // Fallback to random questions if API key not configured
      return new Response(
        JSON.stringify({ questions: getRandomQuestions() }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI to generate contextual questions
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: QUESTION_GENERATION_PROMPT },
          { 
            role: 'user', 
            content: `User's data:\n${userData || 'No user data available'}\n\nRecent conversation:\n${conversationContext}\n\nGenerate 3 natural follow-up questions the user would likely ask next:`
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!openaiResponse.ok) {
      console.error('OpenAI API failed, using fallback questions');
      return new Response(
        JSON.stringify({ questions: getRandomQuestions() }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json();
    const generatedText = data.choices[0].message.content.trim();
    
    // Parse the generated questions
    let questions = generatedText
      .split('\n')
      .filter((q: string) => q.trim().length > 0)
      .map((q: string) => q.replace(/^[0-9]+[\.\)]\s*/, '').replace(/\?$/, '').trim())
      .slice(0, 3);

    // Fallback if parsing failed or didn't get 3 questions
    if (questions.length !== 3) {
      questions = getRandomQuestions();
    }

    return new Response(
      JSON.stringify({ questions }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    // Return fallback questions on error
    return new Response(
      JSON.stringify({ questions: getRandomQuestions() }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

