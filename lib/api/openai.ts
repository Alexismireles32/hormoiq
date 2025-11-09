/**
 * OpenAI GPT-4 API Client (via Supabase Edge Functions)
 * Handles all AI chat interactions securely through Edge Functions
 */

import { ChatMessage } from '@/types';
import { supabase } from '@/lib/supabase';

// Edge Functions are now used instead of direct OpenAI API calls
// This keeps the API key secure on the server side
const USE_EDGE_FUNCTIONS = true;

export interface ChatCompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  user_context?: any;
}

export interface ChatCompletionResponse {
  reply: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * System prompt for the AI hormone coach - Professional, research-backed, precise
 */
export const SYSTEM_PROMPT = `You are HormoIQ's AI Hormone Optimization Coach - a knowledgeable wellness expert specialized in hormone health optimization.

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

/**
 * Send a chat completion request to GPT-4 via Supabase Edge Function
 * This keeps the OpenAI API key secure on the server side
 */
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Call Edge Function instead of OpenAI directly
    const { data, error } = await supabase.functions.invoke('ask-ai', {
      body: {
        messages: request.messages,
        userContext: request.user_context,
      },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    if (!data || !data.reply) {
      throw new Error('Invalid response from AI service');
    }

    return {
      reply: data.reply,
      usage: data.usage,
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    throw error;
  }
}

/**
 * Build comprehensive context string from ALL user data for AI
 */
export function buildUserContext(userData: {
  readyScore?: number;
  readyScoreDetails?: any;
  bioAge?: number;
  bioAgeDetails?: any;
  recentTests?: any[];
  patterns?: string[];
  impactAnalyses?: any[];
  activeProtocols?: any[];
  userProfile?: { 
    age?: number; 
    gender?: string;
    goals?: string[];
    on_hormone_therapy?: boolean;
  };
}): string {
  const parts: string[] = [];

  // User Profile
  if (userData.userProfile) {
    const profile = userData.userProfile;
    parts.push(`=== USER PROFILE ===`);
    parts.push(`Age: ${profile.age} years old`);
    parts.push(`Gender: ${profile.gender}`);
    if (profile.goals && profile.goals.length > 0) {
      parts.push(`Goals: ${profile.goals.join(', ')}`);
    }
    if (profile.on_hormone_therapy) {
      parts.push(`Currently on hormone therapy (HRT/TRT/BC)`);
    }
    parts.push('');
  }

  // Current Status
  if (userData.readyScore !== undefined) {
    parts.push(`=== CURRENT STATUS ===`);
    parts.push(`ReadyScore: ${userData.readyScore}/100`);
    if (userData.readyScoreDetails) {
      parts.push(`Confidence: ${userData.readyScoreDetails.confidence}`);
      if (userData.readyScoreDetails.protocol && userData.readyScoreDetails.protocol.length > 0) {
        parts.push(`Recommendations: ${userData.readyScoreDetails.protocol.join(', ')}`);
      }
    }
    parts.push('');
  }

  if (userData.bioAge !== undefined) {
    parts.push(`BioAge: ${userData.bioAge} years`);
    if (userData.bioAgeDetails) {
      parts.push(`Delta: ${userData.bioAgeDetails.delta > 0 ? '+' : ''}${userData.bioAgeDetails.delta} years`);
      parts.push(`Confidence: ${userData.bioAgeDetails.confidence}`);
    }
    parts.push('');
  }

  // Recent Tests with Full Context
  if (userData.recentTests && userData.recentTests.length > 0) {
    parts.push(`=== RECENT HORMONE TESTS (Last 10) ===`);
    userData.recentTests.forEach(test => {
      const date = new Date(test.timestamp).toLocaleDateString();
      parts.push(`${date} - ${test.hormone_type}: ${test.value}`);
      if (test.sleep_quality) parts.push(`  Sleep: ${test.sleep_quality}/5`);
      if (test.exercised !== undefined) parts.push(`  Exercise: ${test.exercised ? 'Yes' : 'No'}`);
      if (test.stress_level) parts.push(`  Stress: ${test.stress_level}/5`);
      if (test.supplements) parts.push(`  Supplements: ${test.supplements}`);
    });
    parts.push('');
  }

  // Impact Analyses (What Works)
  if (userData.impactAnalyses && userData.impactAnalyses.length > 0) {
    parts.push(`=== WHAT WORKS FOR THIS USER ===`);
    userData.impactAnalyses.forEach(impact => {
      const effect = impact.effect_size > 0 ? `+${impact.effect_size}%` : `${impact.effect_size}%`;
      parts.push(
        `${impact.intervention_name}: ${effect} on ${impact.hormone_affected} (${impact.confidence} confidence) - ${impact.recommendation}`
      );
    });
    parts.push('');
  }

  // Active Protocols
  if (userData.activeProtocols && userData.activeProtocols.length > 0) {
    parts.push(`=== ACTIVE PROTOCOLS ===`);
    userData.activeProtocols.forEach(protocol => {
      parts.push(`${protocol.protocol?.name || protocol.protocol_id}: ${protocol.status}`);
    });
    parts.push('');
  }

  // Detected Patterns
  if (userData.patterns && userData.patterns.length > 0) {
    parts.push(`=== DETECTED PATTERNS ===`);
    parts.push(userData.patterns.join(', '));
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Check if a message contains medical language that should be refused
 */
export function containsMedicalLanguage(message: string): boolean {
  const medicalKeywords = [
    'diagnose',
    'diagnosis',
    'disease',
    'condition',
    'disorder',
    'syndrome',
    'cure',
    'treat',
    'treatment',
    'medication',
    'medicine',
    'prescription',
    'doctor',
    'physician',
  ];

  const lowerMessage = message.toLowerCase();
  return medicalKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Generate a safe refusal response for medical questions
 */
export function getMedicalRefusalResponse(): string {
  return "I can't diagnose medical conditions or provide medical advice - that's beyond my scope and potentially dangerous. Your hormone levels can have many causes, and only a doctor can properly diagnose medical conditions.\n\nI strongly recommend scheduling an appointment with your doctor and showing them your hormone history. They'll be able to run appropriate tests and provide medical guidance.\n\nI'm here to help you optimize your hormones within normal ranges, but medical diagnosis requires a healthcare professional.";
}

/**
 * Generate 3 smart suggested questions based on conversation context
 * These are questions the USER would ask (not questions to the user)
 * Uses Supabase Edge Function to securely call GPT-4
 */
export async function generateSuggestedQuestions(
  conversationContext: string,
  userData: string
): Promise<string[]> {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return getGenericSuggestedQuestions();
    }

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: {
        conversationContext,
        userData,
        isStarter: false,
      },
    });

    if (error || !data || !data.questions) {
      console.error('Error generating suggestions:', error);
      return getGenericSuggestedQuestions();
    }

    return data.questions.length === 3 ? data.questions : getGenericSuggestedQuestions();
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getGenericSuggestedQuestions();
  }
}

/**
 * Get generic starter questions when no conversation history
 * These are questions the user would ask the AI
 * Now uses Edge Function for better personalization
 */
export async function getStarterQuestions(userData?: any): Promise<string[]> {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Fallback questions if not authenticated
      return [
        'How do I get started with testing',
        'What hormones should I track first',
        'What lifestyle factors affect hormones most',
      ];
    }

    // Call Edge Function for personalized starter questions
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: {
        userData,
        isStarter: true,
      },
    });

    if (error || !data || !data.questions) {
      // Fallback based on user data
      if (userData?.testsCount && userData.testsCount > 0) {
        return [
          'What do my recent test results mean',
          'How can I improve my hormone balance',
          'What habits would optimize my scores',
        ];
      }

      return [
        'How do I get started with testing',
        'What hormones should I track first',
        'What lifestyle factors affect hormones most',
      ];
    }

    return data.questions;
  } catch (error) {
    console.error('Error getting starter questions:', error);
    // Fallback
    if (userData?.testsCount && userData.testsCount > 0) {
      return [
        'What do my recent test results mean',
        'How can I improve my hormone balance',
        'What habits would optimize my scores',
      ];
    }

    return [
      'How do I get started with testing',
      'What hormones should I track first',
      'What lifestyle factors affect hormones most',
    ];
  }
}

/**
 * Fallback generic questions when AI generation fails
 * These are diverse, actionable questions a user would ask
 */
function getGenericSuggestedQuestions(): string[] {
  const allQuestions = [
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

  // Randomly pick 3
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

