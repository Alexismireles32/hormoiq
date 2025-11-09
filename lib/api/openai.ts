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
 * System prompt for the AI hormone coach
 */
export const SYSTEM_PROMPT = `You are HormoIQ's personal hormone optimization coach. You help users understand and optimize their hormones.

CRITICAL RULES:
1. You are a WELLNESS coach, not a medical professional
2. NEVER diagnose medical conditions
3. NEVER recommend medications or medical treatments
4. ALWAYS say "Consult your doctor" for medical questions
5. Focus on optimization, not treatment

CAPABILITIES:
- Explain hormone patterns using THEIR specific data
- Suggest lifestyle interventions (sleep, exercise, stress management)
- Recommend supplements (but note: "Consider talking to your doctor")
- Interpret test results in context
- Provide general hormone education

TONE:
- Knowledgeable but conversational
- Encouraging and empathetic
- Concise (2-3 paragraphs max, be focused and direct)
- Reference THEIR data specifically

RESPONSE FORMAT:
- Start with direct answer
- Reference their specific data when relevant
- Provide 1-2 actionable suggestions
- Be encouraging and positive

When users ask medical questions (diagnosis, disease, conditions), politely refuse and strongly recommend seeing a doctor.`;

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
            content: `You are a suggestion generator for a hormone optimization app. Generate exactly 3 short, specific follow-up questions (max 8 words each) that would be helpful for the user to ask next. Base them on:
1. Their current conversation topic
2. Their personal data (test results, patterns, etc.)
3. Actionable wellness optimization

Format: Return ONLY 3 questions, one per line, no numbering, no extra text.
Make them feel natural, conversational, and specific to their data.`,
          },
          {
            role: 'user',
            content: `User's data:\n${userData}\n\nRecent conversation:\n${conversationContext}\n\nGenerate 3 smart follow-up questions:`,
          },
        ],
        temperature: 0.8,
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
      .slice(0, 3);

    return suggestions.length === 3 ? suggestions : getGenericSuggestedQuestions();
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getGenericSuggestedQuestions();
  }
}

/**
 * Get generic starter questions when no conversation history
 */
export function getStarterQuestions(userData?: any): string[] {
  // If user has tests, make them specific
  if (userData?.testsCount && userData.testsCount > 0) {
    return [
      'What do my recent test results mean?',
      'How can I improve my hormone levels?',
      'What should I focus on this week?',
    ];
  }

  // New user with no tests
  return [
    'How do I get started with testing?',
    'What hormones should I track?',
    'What affects my hormone levels?',
  ];
}

/**
 * Fallback generic questions when AI generation fails
 */
function getGenericSuggestedQuestions(): string[] {
  const allQuestions = [
    'What affects cortisol levels most?',
    'How can I improve my sleep?',
    'What supplements should I consider?',
    'How often should I test?',
    'What does my trend mean?',
    'How can I reduce stress?',
    'What exercise is best for hormones?',
    'How does diet affect testosterone?',
    'What time should I test?',
  ];

  // Randomly pick 3
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

