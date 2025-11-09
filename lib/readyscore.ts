/**
 * ReadyScore Calculation System
 * Calculates daily readiness score (0-100) based on hormone levels and context
 */

import { HormoneTest, HORMONE_RANGES, ReadyScore } from '@/types';

interface ReadyScoreCalculation {
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
  lastTestTimestamp?: string;
}

/**
 * Calculate ReadyScore from user's recent tests
 */
export function calculateReadyScore(
  recentTests: HormoneTest[],
  allTests: HormoneTest[],
  userGender: 'male' | 'female' | 'other' = 'male'
): ReadyScoreCalculation {
  // Start with baseline
  let score = 50;
  
  const factors = {
    cortisol_score: 0,
    testosterone_score: 0,
    dhea_score: 0,
    context_bonus: 0,
    trend_bonus: 0,
  };

  // Get most recent test for each hormone (within last 24 hours ideally)
  const latestCortisol = getMostRecentTest(recentTests, 'cortisol');
  const latestTestosterone = getMostRecentTest(recentTests, 'testosterone');
  const latestDHEA = getMostRecentTest(recentTests, 'dhea');

  // Cortisol contribution (+/- 20 points)
  if (latestCortisol) {
    const cortisolRange = HORMONE_RANGES.cortisol;
    factors.cortisol_score = calculateHormoneScore(
      latestCortisol.value,
      cortisolRange.optimal_min,
      cortisolRange.optimal_max,
      20
    );
  }

  // Testosterone contribution (+/- 15 points)
  if (latestTestosterone) {
    const testRange = userGender === 'female' 
      ? HORMONE_RANGES.testosterone.female
      : HORMONE_RANGES.testosterone.male;
    factors.testosterone_score = calculateHormoneScore(
      latestTestosterone.value,
      testRange.optimal_min,
      testRange.optimal_max,
      15
    );
  }

  // DHEA contribution (+/- 10 points)
  if (latestDHEA) {
    const dheaRange = HORMONE_RANGES.dhea;
    factors.dhea_score = calculateHormoneScore(
      latestDHEA.value,
      dheaRange.optimal_min,
      dheaRange.optimal_max,
      10
    );
  }

  // Context modifiers (+/- 15 points)
  const latestTest = getMostRecentTestOverall(recentTests);
  if (latestTest) {
    // Sleep quality bonus/penalty
    if (latestTest.sleep_quality) {
      if (latestTest.sleep_quality >= 4) {
        factors.context_bonus += 10;
      } else if (latestTest.sleep_quality <= 2) {
        factors.context_bonus -= 10;
      }
    }

    // Exercise bonus
    if (latestTest.exercised) {
      factors.context_bonus += 5;
    }

    // Stress penalty
    if (latestTest.stress_level) {
      if (latestTest.stress_level >= 4) {
        factors.context_bonus -= 10;
      }
    }
  }

  // Trend bonus (+/- 10 points)
  const trend = calculateTrend(allTests, userGender);
  if (trend === 'improving') {
    factors.trend_bonus = 10;
  } else if (trend === 'declining') {
    factors.trend_bonus = -10;
  }

  // Calculate total score
  score += factors.cortisol_score;
  score += factors.testosterone_score;
  score += factors.dhea_score;
  score += factors.context_bonus;
  score += factors.trend_bonus;

  // Clamp between 0-100
  score = Math.max(0, Math.min(100, score));

  // Calculate confidence
  const confidence = calculateConfidence(recentTests, allTests);

  // Generate protocol recommendations
  const protocol = generateProtocol(score, latestTest || undefined);

  return {
    score: Math.round(score),
    confidence,
    contributing_factors: factors,
    protocol,
    lastTestTimestamp: latestTest?.timestamp,
  };
}

/**
 * Calculate hormone contribution to score
 */
function calculateHormoneScore(
  value: number,
  optimalMin: number,
  optimalMax: number,
  maxPoints: number
): number {
  // In optimal range: full points
  if (value >= optimalMin && value <= optimalMax) {
    return maxPoints;
  }

  // Slightly off (80-100% or 100-120%): half points
  const lowerBoundary = optimalMin * 0.8;
  const upperBoundary = optimalMax * 1.2;
  
  if ((value >= lowerBoundary && value < optimalMin) ||
      (value > optimalMax && value <= upperBoundary)) {
    return maxPoints * 0.5;
  }

  // Significantly off: negative points
  return -maxPoints * 0.5;
}

/**
 * Calculate confidence level
 */
function calculateConfidence(
  recentTests: HormoneTest[],
  allTests: HormoneTest[]
): 'high' | 'medium' | 'low' {
  const latestTest = getMostRecentTestOverall(recentTests);
  
  if (!latestTest) return 'low';

  const hoursSinceTest = (Date.now() - new Date(latestTest.timestamp).getTime()) / (1000 * 60 * 60);
  const totalTests = allTests.length;

  // High: Test within 12 hours AND 10+ historical tests
  if (hoursSinceTest <= 12 && totalTests >= 10) {
    return 'high';
  }

  // Medium: Test within 24 hours OR 5-10 historical tests
  if (hoursSinceTest <= 24 || (totalTests >= 5 && totalTests < 10)) {
    return 'medium';
  }

  // Low: Everything else
  return 'low';
}

/**
 * Calculate trend (improving/stable/declining)
 */
function calculateTrend(
  allTests: HormoneTest[],
  userGender: 'male' | 'female' | 'other' = 'male'
): 'improving' | 'stable' | 'declining' {
  if (allTests.length < 6) return 'stable';

  // Get last 3 and previous 3 tests
  const sorted = [...allTests].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const recent3 = sorted.slice(0, 3);
  const previous3 = sorted.slice(3, 6);

  // Calculate average "optimality" for each period
  const recentOptimality = calculateAverageOptimality(recent3, userGender);
  const previousOptimality = calculateAverageOptimality(previous3, userGender);

  const improvement = recentOptimality - previousOptimality;

  if (improvement > 0.1) return 'improving';
  if (improvement < -0.1) return 'declining';
  return 'stable';
}

/**
 * Calculate how "optimal" tests are (0-1 scale)
 */
function calculateAverageOptimality(
  tests: HormoneTest[],
  userGender: 'male' | 'female' | 'other' = 'male'
): number {
  if (tests.length === 0) return 0.5;

  let totalOptimality = 0;

  tests.forEach(test => {
    const range = test.hormone_type === 'testosterone'
      ? HORMONE_RANGES.testosterone[userGender === 'female' ? 'female' : 'male']
      : HORMONE_RANGES[test.hormone_type];

    if (test.value >= range.optimal_min && test.value <= range.optimal_max) {
      totalOptimality += 1;
    } else if (
      (test.value >= range.optimal_min * 0.8 && test.value < range.optimal_min) ||
      (test.value > range.optimal_max && test.value <= range.optimal_max * 1.2)
    ) {
      totalOptimality += 0.5;
    } else {
      totalOptimality += 0;
    }
  });

  return totalOptimality / tests.length;
}

/**
 * Generate protocol recommendations based on score
 */
function generateProtocol(score: number, latestTest?: HormoneTest): string[] {
  const protocol: string[] = [];

  if (score >= 80) {
    // Ready (80-100)
    protocol.push('Perfect day for high-intensity training');
    protocol.push('Schedule challenging tasks and meetings');
    protocol.push('Your biology supports peak performance');
  } else if (score >= 60) {
    // Good (60-79)
    protocol.push('Good for steady-state work');
    protocol.push('Moderate intensity exercise recommended');
    protocol.push('Reliable day, not peak but solid');
  } else if (score >= 40) {
    // Moderate (40-59)
    protocol.push('Recovery focus - light movement only');
    protocol.push('Handle routine tasks, delegate hard ones');
    protocol.push('Early bedtime recommended (9 PM)');
  } else {
    // Recovering (0-39)
    protocol.push('Rest day - no intense exercise');
    protocol.push('Prioritize sleep and stress management');
    protocol.push('This is temporary - recovery in 1-2 days');
  }

  // Add context-specific recommendations
  if (latestTest) {
    if (latestTest.sleep_quality && latestTest.sleep_quality <= 2) {
      protocol.push('💤 Priority: Improve sleep quality tonight');
    }
    if (latestTest.stress_level && latestTest.stress_level >= 4) {
      protocol.push('🧘 Priority: Stress management (meditation, breathing)');
    }
  }

  return protocol;
}

/**
 * Get most recent test for specific hormone
 */
function getMostRecentTest(
  tests: HormoneTest[],
  hormoneType: 'cortisol' | 'testosterone' | 'dhea'
): HormoneTest | null {
  const filtered = tests
    .filter(t => t.hormone_type === hormoneType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return filtered[0] || null;
}

/**
 * Get most recent test overall
 */
function getMostRecentTestOverall(tests: HormoneTest[]): HormoneTest | null {
  if (tests.length === 0) return null;

  return tests.reduce((latest, test) => {
    return new Date(test.timestamp) > new Date(latest.timestamp) ? test : latest;
  });
}

/**
 * Get score color
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Yellow
  if (score >= 40) return '#FB923C'; // Orange
  return '#EF4444'; // Red
}

/**
 * Get score label
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Ready ⚡';
  if (score >= 60) return 'Good 👍';
  if (score >= 40) return 'Moderate ⚠️';
  return 'Recovering 🛌';
}

