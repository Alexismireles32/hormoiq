/**
 * READY Score Calculation System
 * Calculates daily readiness score (0-100) based on recent hormone levels
 * 
 * READY = How ready you are for today based on your hormones
 */

import { HormoneTest, HORMONE_RANGES } from '@/types';

export interface ReadyScore {
  score: number; // 0-100
  level: 'exceptional' | 'good' | 'moderate' | 'low' | 'very_low';
  confidence: 'high' | 'medium' | 'low';
  factors: {
    cortisol: {
      score: number;
      status: 'optimal' | 'acceptable' | 'poor';
      latest_value?: number;
      hours_ago?: number;
    };
    testosterone: {
      score: number;
      status: 'optimal' | 'acceptable' | 'poor';
      latest_value?: number;
      hours_ago?: number;
    };
    dhea: {
      score: number;
      status: 'optimal' | 'acceptable' | 'poor';
      latest_value?: number;
      hours_ago?: number;
    };
    trend: {
      score: number;
      direction: 'improving' | 'stable' | 'declining';
    };
    consistency: {
      score: number;
      tests_this_week: number;
    };
  };
  protocol: string[];
  can_calculate: boolean;
  tests_needed?: number;
}

/**
 * Calculate READY score for today
 * 
 * Requirements:
 * - At least 3 tests in the last 7 days
 * - At least 1 test in the last 48 hours for high confidence
 * 
 * @param allTests - All hormone tests for the user
 * @param userGender - User's gender for testosterone ranges
 * @returns READY score with breakdown
 */
export function calculateReadyScore(
  allTests: HormoneTest[],
  userGender: 'male' | 'female' | 'other' = 'male'
): ReadyScore {
  // Check if we have minimum data
  const recentTests = getRecentTests(allTests, 7); // Last 7 days
  const canCalculate = recentTests.length >= 3;

  if (!canCalculate) {
    return {
      score: 0,
      level: 'very_low',
      confidence: 'low',
      factors: {
        cortisol: { score: 0, status: 'poor' },
        testosterone: { score: 0, status: 'poor' },
        dhea: { score: 0, status: 'poor' },
        trend: { score: 0, direction: 'stable' },
        consistency: { score: 0, tests_this_week: recentTests.length },
      },
      protocol: [],
      can_calculate: false,
      tests_needed: 3 - recentTests.length,
    };
  }

  // Calculate individual hormone scores
  const cortisolFactor = calculateHormoneFactor(recentTests, 'cortisol', userGender);
  const testosteroneFactor = calculateHormoneFactor(recentTests, 'testosterone', userGender);
  const dheaFactor = calculateHormoneFactor(recentTests, 'dhea', userGender);

  // Calculate trend score
  const trendFactor = calculateTrendFactor(recentTests);

  // Calculate consistency score
  const consistencyFactor = calculateConsistencyFactor(recentTests);

  // Weighted average for final READY score
  // Hormones: 70% (cortisol 30%, testosterone 25%, dhea 15%)
  // Trend: 15%
  // Consistency: 15%
  const score = Math.round(
    cortisolFactor.score * 0.30 +
    testosteroneFactor.score * 0.25 +
    dheaFactor.score * 0.15 +
    trendFactor.score * 0.15 +
    consistencyFactor.score * 0.15
  );

  // Determine level
  const level = getReadyLevel(score);

  // Determine confidence based on recency
  const confidence = getConfidence(allTests);

  // Generate protocol suggestions
  const protocol = generateProtocol(score, {
    cortisol: cortisolFactor,
    testosterone: testosteroneFactor,
    dhea: dheaFactor,
  });

  return {
    score,
    level,
    confidence,
    factors: {
      cortisol: cortisolFactor,
      testosterone: testosteroneFactor,
      dhea: dheaFactor,
      trend: trendFactor,
      consistency: consistencyFactor,
    },
    protocol,
    can_calculate: true,
  };
}

/**
 * Get tests from the last N days
 */
function getRecentTests(tests: HormoneTest[], days: number): HormoneTest[] {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return tests.filter(t => new Date(t.timestamp).getTime() >= cutoff);
}

/**
 * Calculate hormone-specific factor (0-100)
 */
function calculateHormoneFactor(
  recentTests: HormoneTest[],
  hormoneType: 'cortisol' | 'testosterone' | 'dhea',
  userGender: 'male' | 'female' | 'other' = 'male'
) {
  const hormoneTests = recentTests.filter(t => t.hormone_type === hormoneType);

  if (hormoneTests.length === 0) {
    return {
      score: 50,
      status: 'acceptable' as const,
    };
  }

  // Get most recent test
  const latest = hormoneTests.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  const hoursAgo = (Date.now() - new Date(latest.timestamp).getTime()) / (1000 * 60 * 60);

  // Get optimal range
  const range = hormoneType === 'testosterone'
    ? HORMONE_RANGES.testosterone[userGender === 'female' ? 'female' : 'male']
    : HORMONE_RANGES[hormoneType];

  // Calculate score based on position in range
  let score = 50;
  let status: 'optimal' | 'acceptable' | 'poor' = 'acceptable';

  if (latest.value >= range.optimal_min && latest.value <= range.optimal_max) {
    // In optimal range: 80-100 points
    const rangePosition = (latest.value - range.optimal_min) / (range.optimal_max - range.optimal_min);
    score = 80 + (rangePosition * 20);
    status = 'optimal';
  } else if (latest.value >= range.min && latest.value <= range.max) {
    // In acceptable range: 50-80 points
    if (latest.value < range.optimal_min) {
      // Below optimal
      const rangePosition = (latest.value - range.min) / (range.optimal_min - range.min);
      score = 50 + (rangePosition * 30);
    } else {
      // Above optimal
      const rangePosition = (range.max - latest.value) / (range.max - range.optimal_max);
      score = 50 + (rangePosition * 30);
    }
    status = 'acceptable';
  } else {
    // Out of range: 0-50 points
    if (latest.value < range.min) {
      const deviation = Math.abs(latest.value - range.min) / range.min;
      score = Math.max(0, 50 - (deviation * 50));
    } else {
      const deviation = Math.abs(latest.value - range.max) / range.max;
      score = Math.max(0, 50 - (deviation * 50));
    }
    status = 'poor';
  }

  return {
    score: Math.round(score),
    status,
    latest_value: latest.value,
    hours_ago: Math.round(hoursAgo),
  };
}

/**
 * Calculate trend factor (0-100)
 */
function calculateTrendFactor(recentTests: HormoneTest[]) {
  if (recentTests.length < 4) {
    return {
      score: 50,
      direction: 'stable' as const,
    };
  }

  // Sort by timestamp
  const sorted = [...recentTests].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Compare first half vs second half
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstAvg = calculateAverageOptimality(firstHalf);
  const secondAvg = calculateAverageOptimality(secondHalf);

  const improvement = secondAvg - firstAvg;

  let score = 50;
  let direction: 'improving' | 'stable' | 'declining' = 'stable';

  if (improvement > 0.15) {
    // Improving
    score = 50 + Math.min(50, improvement * 100);
    direction = 'improving';
  } else if (improvement < -0.15) {
    // Declining
    score = 50 - Math.min(50, Math.abs(improvement) * 100);
    direction = 'declining';
  } else {
    // Stable
    score = 50;
    direction = 'stable';
  }

  return {
    score: Math.round(score),
    direction,
  };
}

/**
 * Calculate average optimality (0-1 scale)
 */
function calculateAverageOptimality(tests: HormoneTest[]): number {
  if (tests.length === 0) return 0.5;

  let totalOptimality = 0;

  tests.forEach(test => {
    const range = test.hormone_type === 'testosterone'
      ? HORMONE_RANGES.testosterone.male
      : HORMONE_RANGES[test.hormone_type];

    if (test.value >= range.optimal_min && test.value <= range.optimal_max) {
      totalOptimality += 1;
    } else if (
      (test.value >= range.optimal_min * 0.8 && test.value < range.optimal_min) ||
      (test.value > range.optimal_max && test.value <= range.optimal_max * 1.2)
    ) {
      totalOptimality += 0.5;
    }
  });

  return totalOptimality / tests.length;
}

/**
 * Calculate consistency factor (0-100)
 */
function calculateConsistencyFactor(recentTests: HormoneTest[]) {
  const testsThisWeek = recentTests.length;

  // 0-1 tests: 0-30 points
  // 2-3 tests: 30-60 points
  // 4-6 tests: 60-85 points
  // 7+ tests: 85-100 points

  let score = 0;
  if (testsThisWeek === 0) score = 0;
  else if (testsThisWeek === 1) score = 30;
  else if (testsThisWeek === 2) score = 45;
  else if (testsThisWeek === 3) score = 60;
  else if (testsThisWeek === 4) score = 70;
  else if (testsThisWeek === 5) score = 80;
  else if (testsThisWeek === 6) score = 90;
  else score = 100;

  return {
    score,
    tests_this_week: testsThisWeek,
  };
}

/**
 * Determine READY level from score
 */
function getReadyLevel(score: number): 'exceptional' | 'good' | 'moderate' | 'low' | 'very_low' {
  if (score >= 85) return 'exceptional';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  if (score >= 30) return 'low';
  return 'very_low';
}

/**
 * Determine confidence based on test recency
 */
function getConfidence(allTests: HormoneTest[]): 'high' | 'medium' | 'low' {
  if (allTests.length === 0) return 'low';

  const latest = allTests.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  const hoursAgo = (Date.now() - new Date(latest.timestamp).getTime()) / (1000 * 60 * 60);

  if (hoursAgo <= 24) return 'high';
  if (hoursAgo <= 48) return 'medium';
  return 'low';
}

/**
 * Generate protocol suggestions based on scores
 */
function generateProtocol(
  score: number,
  factors: {
    cortisol: { score: number; status: string };
    testosterone: { score: number; status: string };
    dhea: { score: number; status: string };
  }
): string[] {
  const protocol: string[] = [];

  if (score >= 85) {
    // Exceptional day - push hard
    protocol.push('🚀 High-intensity workout recommended');
    protocol.push('💼 Tackle your most challenging tasks');
    protocol.push('🎯 Set ambitious goals for today');
  } else if (score >= 70) {
    // Good day - normal intensity
    protocol.push('💪 Moderate to high-intensity activities');
    protocol.push('📊 Good day for important decisions');
    protocol.push('🏃 Maintain your usual routine');
  } else if (score >= 50) {
    // Moderate day - be strategic
    protocol.push('🧘 Focus on consistency over intensity');
    protocol.push('⚖️ Balance activity with recovery');
    protocol.push('🎨 Creative or less demanding tasks');
  } else if (score >= 30) {
    // Low day - recovery focus
    protocol.push('🛌 Prioritize rest and recovery');
    protocol.push('🚶 Light activity like walking');
    protocol.push('💤 Early bedtime recommended');
  } else {
    // Very low - take it easy
    protocol.push('🏠 Rest day - avoid intense activity');
    protocol.push('💆 Focus on stress management');
    protocol.push('🍎 Nutrition and hydration priority');
  }

  // Hormone-specific suggestions
  if (factors.cortisol.status === 'poor') {
    protocol.push('💧 High cortisol - reduce stress, avoid caffeine');
  }
  if (factors.testosterone.status === 'poor') {
    protocol.push('⚡ Low testosterone - ensure adequate sleep');
  }
  if (factors.dhea.status === 'poor') {
    protocol.push('🔥 Low DHEA - focus on recovery');
  }

  return protocol.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Get READY color for display
 */
export function getReadyColor(score: number): string {
  if (score >= 85) return '#10B981'; // Green
  if (score >= 70) return '#3B82F6'; // Blue
  if (score >= 50) return '#F59E0B'; // Yellow
  if (score >= 30) return '#FB923C'; // Orange
  return '#EF4444'; // Red
}

/**
 * Get READY emoji
 */
export function getReadyEmoji(score: number): string {
  if (score >= 85) return '🚀';
  if (score >= 70) return '💪';
  if (score >= 50) return '👍';
  if (score >= 30) return '😐';
  return '🛌';
}

/**
 * Get READY message
 */
export function getReadyMessage(score: number): string {
  if (score >= 85) return 'Exceptional! Push your limits today.';
  if (score >= 70) return 'Good! You\'re ready for the day.';
  if (score >= 50) return 'Moderate. Be strategic with your energy.';
  if (score >= 30) return 'Low. Focus on recovery.';
  return 'Very low. Take it easy today.';
}

/**
 * Save READY score to database
 */
export async function saveReadyScore(
  supabase: any,
  userId: string,
  readyData: ReadyScore
): Promise<void> {
  if (!readyData.can_calculate) return;

  const today = new Date().toISOString().split('T')[0];

  await supabase.from('ready_scores').upsert({
    user_id: userId,
    date: today,
    score: readyData.score,
    confidence: readyData.confidence,
    contributing_factors: readyData.factors,
    protocol: readyData.protocol,
  });
}

