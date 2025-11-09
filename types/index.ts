// Type definitions for the HormoiQ app

import { Session, User } from '@supabase/supabase-js';

// ============================================
// AUTH TYPES
// ============================================
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ error: any }>;
}

// ============================================
// DATABASE TYPES
// ============================================

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  birth_year: number | null;
  age: number | null; // Added: Current age for BioAge calculations
  gender: 'male' | 'female' | 'other' | null;
  goals: string[] | null;
  onboarding_completed: boolean;
  is_admin: boolean; // Added: Admin access flag
  created_at: string;
  updated_at: string;
}

// Hormone Test
export interface HormoneTest {
  id: string;
  user_id: string;
  hormone_type: 'cortisol' | 'testosterone' | 'dhea';
  value: number;
  timestamp: string;
  sleep_quality: 1 | 2 | 3 | 4 | 5 | null;
  exercised: boolean | null;
  stress_level: 1 | 2 | 3 | 4 | 5 | null;
  supplements: string | null;
  created_at: string;
}

// Ready Score
export interface ReadyScore {
  id: string;
  user_id: string;
  date: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  contributing_factors: {
    cortisol_score: number;
    testosterone_score: number;
    dhea_score: number;
    context_bonus: number;
    trend_bonus: number;
  };
  protocol: string[];
  created_at: string;
}

// BioAge
export interface BioAge {
  id: string;
  user_id: string;
  chronological_age: number;
  biological_age: number;
  delta: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    cortisol_years: number;
    testosterone_years: number;
    dhea_years: number;
    trend_years: number;
    consistency_bonus: number;
  };
  calculated_at: string;
}

// Protocol
export interface Protocol {
  id: string;
  name: string;
  category: 'sleep' | 'stress' | 'exercise' | 'nutrition' | 'supplements' | 'lifestyle';
  description: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  duration_days: number;
  target_hormones: ('cortisol' | 'testosterone' | 'dhea')[];
  instructions: {
    daily?: string[];
    weekly?: string[];
    tips?: string[];
  };
  expected_results: string;
  icon: string;
  created_at: string;
}

// User Protocol (user's active/completed protocols)
export interface UserProtocol {
  id: string;
  user_id: string;
  protocol_id: string;
  protocol?: Protocol; // Joined data
  status: 'active' | 'completed' | 'stopped';
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  effectiveness_rating: number | null; // 1-5
}

// Protocol Log (daily compliance tracking)
export interface ProtocolLog {
  id: string;
  user_protocol_id: string;
  date: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

// Impact Analysis
export interface ImpactAnalysis {
  id: string;
  user_id: string;
  intervention_name: string;
  intervention_type: 'supplement' | 'habit' | 'context' | 'protocol';
  hormone_affected: 'cortisol' | 'testosterone' | 'dhea';
  effect_size: number;
  p_value: number;
  confidence: 'high' | 'medium' | 'low';
  tests_with: number;
  tests_without: number;
  recommendation: 'keep' | 'stop' | 'need_more_data';
  calculated_at: string;
}

// Chat Message
export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context_provided?: {
    readyscore?: number;
    bioage?: number;
    recent_tests?: HormoneTest[];
    patterns?: string[];
  };
  timestamp: string;
}

// User Pattern
export interface UserPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_value: string;
  confidence: number;
  last_updated: string;
}

// ============================================
// NAVIGATION TYPES
// ============================================
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  '(onboarding)': undefined;
  modal: undefined;
};

export type TabsParamList = {
  test: undefined;
  track: undefined;
  impact: undefined;
  ask: undefined;
  profile: undefined;
};

// ============================================
// FORM TYPES
// ============================================
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  confirmPassword: string;
}

export interface OnboardingFormData {
  birth_year: number;
  gender: 'male' | 'female' | 'other';
  goals: string[];
}

export interface HormoneTestFormData {
  hormone_type: 'cortisol' | 'testosterone' | 'dhea';
  value: number;
  timestamp: Date;
  sleep_quality: 1 | 2 | 3 | 4 | 5;
  exercised: boolean;
  stress_level: 1 | 2 | 3 | 4 | 5;
  supplements?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ChatResponse {
  reply: string;
  context_used: any;
}

// ============================================
// UI STATE TYPES
// ============================================
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

// ============================================
// CALCULATION TYPES
// ============================================
export interface HormoneRange {
  min: number;
  max: number;
  optimal_min: number;
  optimal_max: number;
  unit: string;
}

export interface HormoneRanges {
  cortisol: HormoneRange;
  testosterone: {
    male: HormoneRange;
    female: HormoneRange;
  };
  dhea: HormoneRange;
}

// Optimal ranges by hormone
export const HORMONE_RANGES: HormoneRanges = {
  cortisol: {
    min: 0,
    max: 50,
    optimal_min: 8,
    optimal_max: 25,
    unit: 'ng/mL',
  },
  testosterone: {
    male: {
      min: 0,
      max: 1500,
      optimal_min: 300,
      optimal_max: 1000,
      unit: 'ng/dL',
    },
    female: {
      min: 0,
      max: 200,
      optimal_min: 15,
      optimal_max: 70,
      unit: 'ng/dL',
    },
  },
  dhea: {
    min: 0,
    max: 1000,
    optimal_min: 200,
    optimal_max: 500,
    unit: 'ng/dL',
  },
};
