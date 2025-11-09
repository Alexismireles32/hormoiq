/**
 * Feature Unlock Requirements
 * SINGLE SOURCE OF TRUTH for all feature unlock logic
 * 
 * IMPORTANT: All components must use these constants
 * Do not hardcode requirements anywhere else!
 */

export interface FeatureRequirement {
  minTests: number;
  minDays?: number;
  minWeeks?: number;
  description: string;
  shortDescription: string;
}

export const FEATURE_REQUIREMENTS = {
  /**
   * READYSCORE™ Requirements
   * Daily wellness number (0-100)
   */
  READYSCORE: {
    minTests: 1, // Progressive: Shows from first test
    minDays: 0,  // No day requirement for initial display
    optimalTests: 3, // For high accuracy
    optimalDays: 7,  // Tests should be within last 7 days
    description: 'Track your daily wellness number. Unlocks with your first test, becomes more accurate with 3+ tests in the last week.',
    shortDescription: 'Daily wellness score',
  } as const,

  /**
   * BIOAGE™ Requirements  
   * Biological age calculation
   */
  BIOAGE: {
    minTests: 10,
    minWeeks: 2, // Tests must span at least 2 weeks
    description: 'Discover your biological age based on hormone patterns. Requires 10 tests collected over at least 2 weeks.',
    shortDescription: 'Biological age calculation',
  } as const,

  /**
   * IMPACT™ Requirements
   * Intervention effectiveness analysis
   */
  IMPACT: {
    minTests: 10,
    minWeeks: 2, // Need time to see patterns
    description: 'See what interventions work for you. Requires 10 tests over at least 2 weeks to analyze patterns.',
    shortDescription: 'Intervention analysis',
  } as const,

  /**
   * ASK™ Requirements
   * AI Hormone Coach
   */
  ASK: {
    minTests: 0, // Always available
    description: 'Get personalized hormone coaching from AI. Available immediately, becomes more personalized with more data.',
    shortDescription: 'AI hormone coach',
  } as const,

  /**
   * PROTOCOLS Requirements
   * Optimization protocols library
   */
  PROTOCOLS: {
    minTests: 0, // Always available
    description: 'Browse and follow hormone optimization protocols. Available immediately.',
    shortDescription: 'Protocol library',
  } as const,
} as const;

/**
 * Check if ReadyScore can be calculated
 * Progressive: Shows from test 1, improves with more tests
 */
export function canCalculateReadyScore(
  testCount: number,
  testsThisWeek: number
): {
  canShow: boolean;
  isOptimal: boolean;
  testsNeeded: number;
  message: string;
} {
  const { minTests, optimalTests } = FEATURE_REQUIREMENTS.READYSCORE;
  
  const canShow = testCount >= minTests;
  const isOptimal = testsThisWeek >= (optimalTests || 3);
  const testsNeeded = Math.max(0, minTests - testCount);

  let message = '';
  if (!canShow) {
    message = `Log ${testsNeeded} test${testsNeeded !== 1 ? 's' : ''} to unlock`;
  } else if (!isOptimal) {
    const needed = (optimalTests || 3) - testsThisWeek;
    message = `${needed} more test${needed !== 1 ? 's' : ''} this week for optimal accuracy`;
  } else {
    message = 'High accuracy';
  }

  return { canShow, isOptimal, testsNeeded, message };
}

/**
 * Check if BioAge can be calculated
 * Requires 10 tests over at least 2 weeks
 */
export function canCalculateBioAge(
  testCount: number,
  earliestTestDate: Date | null,
  latestTestDate: Date | null
): {
  canCalculate: boolean;
  testsNeeded: number;
  daysNeeded: number;
  message: string;
} {
  const { minTests, minWeeks } = FEATURE_REQUIREMENTS.BIOAGE;
  const minDays = (minWeeks || 0) * 7;

  const hasEnoughTests = testCount >= minTests;
  const testsNeeded = Math.max(0, minTests - testCount);

  let hasEnoughDays = true;
  let daysNeeded = 0;

  if (earliestTestDate && latestTestDate) {
    const daySpan = Math.floor(
      (latestTestDate.getTime() - earliestTestDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    hasEnoughDays = daySpan >= minDays;
    daysNeeded = Math.max(0, minDays - daySpan);
  } else if (testCount > 0) {
    // Have tests but dates not provided
    hasEnoughDays = false;
    daysNeeded = minDays;
  }

  const canCalculate = hasEnoughTests && hasEnoughDays;

  let message = '';
  if (!hasEnoughTests) {
    message = `${testsNeeded} more test${testsNeeded !== 1 ? 's' : ''} needed`;
  } else if (!hasEnoughDays) {
    message = `Test over ${daysNeeded} more days`;
  } else {
    message = 'Unlocked';
  }

  return { canCalculate, testsNeeded, daysNeeded, message };
}

/**
 * Check if Impact can be calculated
 * Requires 10 tests over at least 2 weeks
 */
export function canCalculateImpact(
  testCount: number,
  earliestTestDate: Date | null,
  latestTestDate: Date | null
): {
  canCalculate: boolean;
  testsNeeded: number;
  daysNeeded: number;
  message: string;
} {
  const { minTests, minWeeks } = FEATURE_REQUIREMENTS.IMPACT;
  const minDays = (minWeeks || 0) * 7;

  const hasEnoughTests = testCount >= minTests;
  const testsNeeded = Math.max(0, minTests - testCount);

  let hasEnoughDays = true;
  let daysNeeded = 0;

  if (earliestTestDate && latestTestDate) {
    const daySpan = Math.floor(
      (latestTestDate.getTime() - earliestTestDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    hasEnoughDays = daySpan >= minDays;
    daysNeeded = Math.max(0, minDays - daySpan);
  } else if (testCount > 0) {
    hasEnoughDays = false;
    daysNeeded = minDays;
  }

  const canCalculate = hasEnoughTests && hasEnoughDays;

  let message = '';
  if (!hasEnoughTests) {
    message = `${testsNeeded} more test${testsNeeded !== 1 ? 's' : ''} needed`;
  } else if (!hasEnoughDays) {
    message = `Test over ${daysNeeded} more days`;
  } else {
    message = 'Unlocked';
  }

  return { canCalculate, testsNeeded, daysNeeded, message };
}

/**
 * Get progress percentage for a feature
 */
export function getFeatureProgress(
  featureName: keyof typeof FEATURE_REQUIREMENTS,
  testCount: number,
  testsThisWeek?: number
): number {
  const feature = FEATURE_REQUIREMENTS[featureName];

  if (featureName === 'READYSCORE') {
    // Progressive: Show progress toward optimal
    const optimal = FEATURE_REQUIREMENTS.READYSCORE.optimalTests || 3;
    return Math.min(100, ((testsThisWeek || 0) / optimal) * 100);
  }

  // Other features: Progress toward minimum
  return Math.min(100, (testCount / feature.minTests) * 100);
}

