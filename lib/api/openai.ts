/**
 * OpenAI GPT-4 API Client
 * Handles all AI chat interactions
 */

import { ChatMessage } from '@/types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

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
 * Send a chat completion request to GPT-4
 */
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: request.messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    
    return {
      reply: data.choices[0].message.content,
      usage: data.usage,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
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
 * Uses GPT-4 to create contextually relevant follow-up questions
 */
export async function generateSuggestedQuestions(
  conversationContext: string,
  userData: string
): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    // Fallback to generic questions if API key missing
    return getGenericSuggestedQuestions();
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a suggestion generator for HormoIQ, a hormone optimization app. Your job is to predict what the USER would most likely want to ask NEXT as a follow-up.

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

Format: Return ONLY 3 questions, one per line, no numbering, no extra text, no punctuation at the end.`,
          },
          {
            role: 'user',
            content: `User's data:\n${userData}\n\nRecent conversation:\n${conversationContext}\n\nGenerate 3 natural follow-up questions the user would likely ask next:`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      return getGenericSuggestedQuestions();
    }

    const data = await response.json();
    const suggestions = data.choices[0].message.content
      .trim()
      .split('\n')
      .filter((q: string) => q.trim().length > 0)
      .map((q: string) => q.replace(/^[0-9]+[\.\)]\s*/, '').replace(/\?$/, '').trim()) // Clean up numbering and trailing ?
      .slice(0, 3);

    return suggestions.length === 3 ? suggestions : getGenericSuggestedQuestions();
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getGenericSuggestedQuestions();
  }
}

/**
 * Get generic starter questions when no conversation history
 * These are questions the user would ask the AI
 */
export function getStarterQuestions(userData?: any): string[] {
  // If user has tests, make them specific to their data
  if (userData?.testsCount && userData.testsCount > 0) {
    return [
      'What do my recent test results mean',
      'How can I improve my hormone balance',
      'What habits would optimize my scores',
    ];
  }

  // New user with no tests
  return [
    'How do I get started with testing',
    'What hormones should I track first',
    'What lifestyle factors affect hormones most',
  ];
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

