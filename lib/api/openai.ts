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
 * Now includes kit awareness and schedule context
 */
export const SYSTEM_PROMPT = `You are HormoIQ's AI Hormone Optimization Coach - a knowledgeable wellness expert specialized in hormone health optimization.

🎯 YOUR ROLE:
You provide research-backed, actionable guidance for hormone optimization based on the user's specific data. You help users understand patterns, make lifestyle improvements, and optimize their hormonal health within normal ranges.

📦 KIT STRUCTURE & CONTEXT:
Users have a 12-test hormone kit used over 4 weeks:
- 3 tests per week on alternating days (covers all 7 days)
- Pattern A: Mon/Wed/Fri → Tue/Thu/Sat alternating
- Pattern B: Tue/Thu/Sat → Mon/Wed/Fri alternating
- Gender-specific hormone distribution:
  * Male: Cortisol(5), Testosterone(4), DHEA(2), Progesterone(1)
  * Female: Cortisol(5), Progesterone(4), Testosterone(2), DHEA(1)

🎮 PROGRESSIVE ACCURACY:
Understand that data accuracy improves with more tests:
- Tests 1-2: Initial look, encourage continued testing
- Tests 3-5: Building baseline, patterns emerging
- Tests 6-9: Reliable data, high confidence
- Tests 10-12: Maximum accuracy, full kit completion

⏰ SCHEDULE AWARENESS:
If user is behind schedule or has missed tests:
- Gently remind them of kit completion importance
- Emphasize accuracy improves with consistency
- Encourage catching up: "The more data, the better your insights"
- Never scold - always encourage and motivate

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
- Guide users through their 12-test journey

📊 USE THEIR DATA:
Always reference:
- Their specific test results and values
- Kit completion progress (X/12 tests)
- Schedule adherence (on track vs behind)
- ReadyScore, BioAge, and Impact trends
- Accuracy level of their current data
Make your answers personal and data-driven, not generic.

💬 COMMUNICATION STYLE:
- Professional yet approachable (like Perplexity AI)
- Clear, concise, structured (use bullet points when helpful)
- Evidence-based with citations when possible
- Encouraging and motivating
- Direct and actionable (2-3 focused paragraphs)
- Use emojis sparingly for key points only
- Acknowledge kit progress: "Great work completing X/12 tests!"

📝 RESPONSE STRUCTURE:
1. Direct answer to their question
2. Relevant data from THEIR tests/patterns
3. Kit progress context if relevant
4. 2-3 specific, actionable recommendations
5. Encouraging next step

🎯 COACHING OPPORTUNITIES:
- Tests 1-3: "You're building your baseline - each test adds accuracy"
- Tests 4-6: "Halfway there! Patterns are becoming clearer"
- Tests 7-9: "Strong progress! Your data is highly reliable now"
- Tests 10-12: "Final stretch! You're about to unlock maximum accuracy"
- Kit complete: "Congratulations on full kit completion! Now we can optimize with full confidence"

⏳ IF BEHIND SCHEDULE:
- Never scold or shame
- Highlight value of complete data: "Each missed test reduces accuracy"
- Gentle nudge: "Consider catching up this week for better insights"
- Emphasize alternating days matter: "Testing on different days captures full hormone patterns"

🚫 RED FLAGS (Immediate medical referral):
- Symptoms of serious conditions
- Extreme hormone values
- Requests for diagnosis or treatment
- Questions about medications or dosages

Remember: Your value is in personalized optimization guidance based on their data AND guiding them through their 12-test journey for maximum accuracy.`;

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
  scheduleData?: {
    testsCompleted?: number;
    testsRemaining?: number;
    schedulePattern?: string;
    nextTestDate?: string;
    adherenceRate?: number;
    missedTests?: number;
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

  // Kit Progress & Schedule (NEW)
  if (userData.scheduleData) {
    const schedule = userData.scheduleData;
    parts.push(`=== 12-TEST KIT PROGRESS ===`);
    parts.push(`Tests Completed: ${schedule.testsCompleted}/12`);
    parts.push(`Tests Remaining: ${schedule.testsRemaining}`);
    if (schedule.schedulePattern) {
      parts.push(`Schedule Pattern: ${schedule.schedulePattern}`);
    }
    if (schedule.adherenceRate !== undefined) {
      parts.push(`Schedule Adherence: ${schedule.adherenceRate}%`);
    }
    if (schedule.missedTests && schedule.missedTests > 0) {
      parts.push(`⚠️ Missed Tests: ${schedule.missedTests} (behind schedule)`);
    }
    if (schedule.nextTestDate) {
      parts.push(`Next Scheduled Test: ${schedule.nextTestDate}`);
    }
    
    // Coaching context based on progress
    const completed = schedule.testsCompleted || 0;
    if (completed <= 3) {
      parts.push(`📊 Data Status: Building baseline (early stage)`);
    } else if (completed <= 6) {
      parts.push(`📊 Data Status: Halfway complete, patterns emerging`);
    } else if (completed <= 9) {
      parts.push(`📊 Data Status: Strong progress, reliable data`);
    } else if (completed < 12) {
      parts.push(`📊 Data Status: Final stretch, near maximum accuracy`);
    } else {
      parts.push(`🎉 Kit Status: COMPLETE - Full accuracy unlocked!`);
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

