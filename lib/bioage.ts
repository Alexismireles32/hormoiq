/**
 * BioAge Calculation System - Research-Backed Algorithm
 * Based on reconciled research from 40+ peer-reviewed studies
 * 
 * KEY SOURCES:
 * - Osaka University (2025): Cortisol alone = strongest predictor
 * - MIDUS Study (2024): Cortisol/DHEA ratio = best predictor
 * - Baltimore Longitudinal Study (2020): 1,814 participants
 * - Massachusetts Male Aging Study: Testosterone decline validated
 * - PAQUID Study (2001): Low DHEA = 6.5x mortality risk
 */

import { HormoneTest, BioAge } from '@/types';

interface BioAgeCalculation {
  chronological_age: number;
  biological_age: number;
  delta: number; // positive = younger, negative = older
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    cortisol_years: number;
    testosterone_years: number;
    dhea_years: number;
    ratio_years: number;
    behavior_bonus: number;
  };
  percentile: {
    ranking: number;
    message: string;
    emoji: string;
  };
  can_calculate: boolean;
  tests_needed?: number;
}

interface HormoneRange {
  minAge: number;
  maxAge: number;
  min: number;
  max: number;
  mean: number;
  lowThreshold?: number;
}

// ============================================
// AGE/GENDER-SPECIFIC HORMONE RANGES
// ============================================

const CORTISOL_RANGES: { male: HormoneRange[]; female: HormoneRange[] } = {
  male: [
    { minAge: 20, maxAge: 30, min: 8, max: 20, mean: 14 },
    { minAge: 31, maxAge: 40, min: 8, max: 18, mean: 13 },
    { minAge: 41, maxAge: 50, min: 8, max: 16, mean: 12 },
    { minAge: 51, maxAge: 60, min: 9, max: 19, mean: 14 },
    { minAge: 61, maxAge: 70, min: 10, max: 22, mean: 16 },
    { minAge: 71, maxAge: 120, min: 11, max: 25, mean: 18 },
  ],
  female: [
    { minAge: 20, maxAge: 30, min: 7, max: 18, mean: 12 },
    { minAge: 31, maxAge: 40, min: 7, max: 17, mean: 11 },
    { minAge: 41, maxAge: 50, min: 7, max: 15, mean: 10 },
    { minAge: 51, maxAge: 60, min: 8, max: 18, mean: 13 },
    { minAge: 61, maxAge: 70, min: 9, max: 21, mean: 15 },
    { minAge: 71, maxAge: 120, min: 10, max: 24, mean: 17 },
  ],
};

const TESTOSTERONE_RANGES: { male: HormoneRange[]; female: HormoneRange[] } = {
  male: [
    { minAge: 18, maxAge: 25, min: 600, max: 1000, mean: 800, lowThreshold: 300 },
    { minAge: 26, maxAge: 35, min: 500, max: 900, mean: 700, lowThreshold: 300 },
    { minAge: 36, maxAge: 45, min: 400, max: 800, mean: 600, lowThreshold: 300 },
    { minAge: 46, maxAge: 55, min: 350, max: 700, mean: 500, lowThreshold: 300 },
    { minAge: 56, maxAge: 65, min: 300, max: 600, mean: 450, lowThreshold: 250 },
    { minAge: 66, maxAge: 120, min: 250, max: 550, mean: 400, lowThreshold: 200 },
  ],
  female: [
    { minAge: 18, maxAge: 25, min: 40, max: 70, mean: 55, lowThreshold: 15 },
    { minAge: 26, maxAge: 35, min: 35, max: 65, mean: 50, lowThreshold: 15 },
    { minAge: 36, maxAge: 45, min: 30, max: 60, mean: 45, lowThreshold: 15 },
    { minAge: 46, maxAge: 55, min: 25, max: 55, mean: 40, lowThreshold: 10 },
    { minAge: 56, maxAge: 120, min: 15, max: 40, mean: 25, lowThreshold: 7 },
  ],
};

const DHEA_RANGES: { male: HormoneRange[]; female: HormoneRange[] } = {
  male: [
    { minAge: 20, maxAge: 29, min: 400, max: 560, mean: 480, lowThreshold: 300 },
    { minAge: 30, maxAge: 39, min: 350, max: 500, mean: 400, lowThreshold: 250 },
    { minAge: 40, maxAge: 49, min: 280, max: 400, mean: 320, lowThreshold: 200 },
    { minAge: 50, maxAge: 59, min: 200, max: 300, mean: 240, lowThreshold: 150 },
    { minAge: 60, maxAge: 69, min: 120, max: 200, mean: 160, lowThreshold: 100 },
    { minAge: 70, maxAge: 120, min: 80, max: 150, mean: 100, lowThreshold: 50 },
  ],
  female: [
    { minAge: 20, maxAge: 29, min: 350, max: 500, mean: 420, lowThreshold: 250 },
    { minAge: 30, maxAge: 39, min: 280, max: 400, mean: 340, lowThreshold: 200 },
    { minAge: 40, maxAge: 49, min: 200, max: 320, mean: 260, lowThreshold: 150 },
    { minAge: 50, maxAge: 59, min: 140, max: 220, mean: 180, lowThreshold: 100 },
    { minAge: 60, maxAge: 69, min: 80, max: 150, mean: 110, lowThreshold: 60 },
    { minAge: 70, maxAge: 120, min: 50, max: 100, mean: 70, lowThreshold: 30 },
  ],
};

// ============================================
// MAIN BIOAGE CALCULATION
// ============================================

/**
 * Calculate BioAge from user's hormone history
 * 
 * @param allTests - All hormone tests for the user
 * @param chronologicalAge - User's actual age
 * @param userGender - User's gender for hormone ranges
 * @returns BioAge calculation with detailed breakdown
 */
export function calculateBioAge(
  allTests: HormoneTest[],
  chronologicalAge: number,
  userGender: 'male' | 'female' | 'other' = 'male'
): BioAgeCalculation {
  // Check unlock requirements: 10 tests over at least 2 weeks
  const canCalculate = checkUnlockRequirements(allTests);
  
  if (!canCalculate) {
    const testsNeeded = Math.max(0, 10 - allTests.length);
    return {
      chronological_age: chronologicalAge,
      biological_age: chronologicalAge,
      delta: 0,
      confidence: 'low',
      breakdown: {
        cortisol_years: 0,
        testosterone_years: 0,
        dhea_years: 0,
        ratio_years: 0,
        behavior_bonus: 0,
      },
      percentile: {
        ranking: 50,
        message: 'Insufficient data',
        emoji: '📊',
      },
      can_calculate: false,
      tests_needed: testsNeeded,
    };
  }

  const gender = userGender === 'female' ? 'female' : 'male';

  // Calculate individual hormone scores
  const cortisolScore = calculateCortisolScore(allTests, chronologicalAge, gender);
  const testosteroneScore = calculateTestosteroneScore(allTests, chronologicalAge, gender);
  const dheaScore = calculateDHEAScore(allTests, chronologicalAge, gender);
  const ratioScore = calculateCortisolDHEARatio(allTests);
  const behaviorBonus = calculateBehaviorBonuses(allTests, chronologicalAge, gender);

  // Apply weights
  const CORTISOL_WEIGHT = 1.5; // Most powerful predictor (Osaka 2025)
  const TESTOSTERONE_WEIGHT = gender === 'male' ? 1.2 : 1.0;
  const DHEA_WEIGHT = (gender === 'male' && chronologicalAge >= 50) ? 1.3 : 1.0;

  // Calculate total adjustment
  let ageAdjustment = 0;
  ageAdjustment += cortisolScore * CORTISOL_WEIGHT;
  ageAdjustment += testosteroneScore * TESTOSTERONE_WEIGHT;
  ageAdjustment += dheaScore * DHEA_WEIGHT;
  ageAdjustment += ratioScore;
  ageAdjustment += behaviorBonus;

  // Calculate bio age
  let bioAge = chronologicalAge + ageAdjustment;

  // Constrain to ±15 years
  bioAge = Math.max(chronologicalAge - 15, Math.min(bioAge, chronologicalAge + 15));

  // Calculate delta (positive = younger)
  const delta = chronologicalAge - bioAge;

  // Calculate confidence
  const confidence = calculateBioAgeConfidence(allTests);

  // Calculate percentile
  const percentile = getPercentileRanking(delta);

  return {
    chronological_age: chronologicalAge,
    biological_age: Math.round(bioAge),
    delta: Math.round(delta),
    confidence,
    breakdown: {
      cortisol_years: Number((cortisolScore * CORTISOL_WEIGHT).toFixed(1)),
      testosterone_years: Number((testosteroneScore * TESTOSTERONE_WEIGHT).toFixed(1)),
      dhea_years: Number((dheaScore * DHEA_WEIGHT).toFixed(1)),
      ratio_years: Number(ratioScore.toFixed(1)),
      behavior_bonus: Number(behaviorBonus.toFixed(1)),
    },
    percentile,
    can_calculate: true,
  };
}

// ============================================
// HORMONE-SPECIFIC SCORING FUNCTIONS
// ============================================

/**
 * Calculate cortisol aging score (-1.5 to +3 years before weighting)
 */
function calculateCortisolScore(
  tests: HormoneTest[],
  age: number,
  gender: 'male' | 'female'
): number {
  const cortisolTests = tests.filter(t => t.hormone_type === 'cortisol');
  if (cortisolTests.length === 0) return 0;

  let score = 0;

  // Get age-appropriate range
  const range = getHormoneRange(CORTISOL_RANGES, age, gender);
  const avgCortisol = average(cortisolTests.map(t => t.value));

  // Step 1: Compare to optimal range
  if (avgCortisol >= range.min && avgCortisol <= range.max) {
    score += 0; // Perfect
  } else if (avgCortisol > range.max) {
    const percentAbove = ((avgCortisol - range.max) / range.max) * 100;
    if (percentAbove <= 30) score += 0.5;
    else if (percentAbove <= 50) score += 1;
    else score += 2;
  } else if (avgCortisol < range.min * 0.9) {
    score += 0.5; // Adrenal insufficiency concern
  }

  // Step 2: Consistency bonus (if 4+ weeks of data)
  if (cortisolTests.length >= 12 && getWeeksCovered(cortisolTests) >= 4) {
    const inRangePercent = cortisolTests.filter(t =>
      t.value >= range.min && t.value <= range.max
    ).length / cortisolTests.length;

    if (inRangePercent >= 0.8) score -= 1; // 80%+ optimal = -1 year
    else if (inRangePercent < 0.4) score += 1; // <40% optimal = +1 year
  }

  return score;
}

/**
 * Calculate testosterone aging score (-2 to +3.5 years before weighting)
 */
function calculateTestosteroneScore(
  tests: HormoneTest[],
  age: number,
  gender: 'male' | 'female'
): number {
  const testTests = tests.filter(t => t.hormone_type === 'testosterone');
  if (testTests.length === 0) return 0;

  let score = 0;
  const avgTestosterone = average(testTests.map(t => t.value));
  const range = getHormoneRange(TESTOSTERONE_RANGES, age, gender);

  if (gender === 'male') {
    // Step 1: Compare to age-appropriate range
    const top30Threshold = range.mean + (range.max - range.mean) * 0.5;
    const bottom30Threshold = range.mean - (range.mean - range.min) * 0.5;

    if (avgTestosterone >= top30Threshold) {
      score -= 1.5; // Top 30% = -1.5 years
    } else if (avgTestosterone >= bottom30Threshold) {
      score += 0; // Middle 40% = normal
    } else if (avgTestosterone >= (range.lowThreshold || 300)) {
      score += 1; // Bottom 30% but not clinical = +1 year
    } else {
      score += 2; // Below clinical threshold = +2 years
    }

    // Step 2: Rate of decline (if 10+ tests over 3+ months)
    if (testTests.length >= 10 && getMonthsCovered(testTests) >= 3) {
      const declineRate = calculateDeclineRate(testTests);
      if (declineRate <= 0) score -= 0.5; // Stable/improving
      else if (declineRate <= 2) score += 0; // Normal decline
      else if (declineRate <= 5) score += 0.5; // Faster decline
      else score += 1.5; // Rapid decline
    }
  } else {
    // Women's scoring
    const percentBelowOptimal = ((range.mean - avgTestosterone) / range.mean) * 100;

    if (avgTestosterone >= range.min && avgTestosterone <= range.max) {
      score += 0; // Optimal
    } else if (percentBelowOptimal >= 10 && percentBelowOptimal <= 20) {
      score += 0.5;
    } else if (percentBelowOptimal > 20 && percentBelowOptimal <= 40) {
      score += 1;
    } else if (percentBelowOptimal > 40) {
      score += 1.5;
    } else if (avgTestosterone > 70) {
      score += 1; // Unusually high (possible PCOS)
    }
  }

  return score;
}

/**
 * Calculate DHEA aging score (-1.5 to +3.5 years before weighting)
 */
function calculateDHEAScore(
  tests: HormoneTest[],
  age: number,
  gender: 'male' | 'female'
): number {
  const dheaTests = tests.filter(t => t.hormone_type === 'dhea');
  if (dheaTests.length === 0) return 0;

  let score = 0;
  const avgDHEA = average(dheaTests.map(t => t.value));
  const range = getHormoneRange(DHEA_RANGES, age, gender);

  // Step 1: Compare to optimal range
  const percentBelowOptimal = ((range.mean - avgDHEA) / range.mean) * 100;

  if (avgDHEA >= range.min && avgDHEA <= range.max) {
    score += 0; // Optimal
  } else if (percentBelowOptimal >= 10 && percentBelowOptimal <= 30) {
    score += 0.5;
  } else if (percentBelowOptimal > 30 && percentBelowOptimal <= 60) {
    score += 1;
  } else if (percentBelowOptimal > 60) {
    score += 1.5;
  }

  // Step 2: Rate of decline (if 10+ tests over 6+ months)
  if (dheaTests.length >= 10 && getMonthsCovered(dheaTests) >= 6) {
    const declineRate = calculateDeclineRate(dheaTests);
    if (declineRate <= 0) score -= 1; // Stable/improving = longevity marker!
    else if (declineRate <= 3) score += 0; // Expected decline
    else if (declineRate <= 6) score += 0.5; // Faster decline
    else score += 1; // Rapid decline
  }

  return score;
}

/**
 * Calculate Cortisol/DHEA ratio score (-0.5 to +1 year)
 * CRITICAL: Most powerful predictor (MIDUS 2024)
 */
function calculateCortisolDHEARatio(tests: HormoneTest[]): number {
  const recentCortisol = tests.filter(t => t.hormone_type === 'cortisol').slice(0, 5);
  const recentDHEA = tests.filter(t => t.hormone_type === 'dhea').slice(0, 5);

  if (recentCortisol.length === 0 || recentDHEA.length === 0) return 0;

  const avgCortisol = average(recentCortisol.map(t => t.value));
  const avgDHEA = average(recentDHEA.map(t => t.value));

  const ratio = avgCortisol / avgDHEA;

  // Research-backed thresholds
  if (ratio < 5) return -0.5; // Excellent balance
  else if (ratio >= 5 && ratio <= 10) return 0; // Normal
  else if (ratio > 10 && ratio <= 20) return 0.5; // Warning
  else return 1; // Severe imbalance
}

/**
 * Calculate behavior bonuses (-2 to +1 years)
 */
function calculateBehaviorBonuses(
  tests: HormoneTest[],
  age: number,
  gender: 'male' | 'female'
): number {
  let bonus = 0;

  // Testing consistency (3+ times per week for 4+ weeks)
  const weeks = getWeeksCovered(tests);
  const testsPerWeek = tests.length / weeks;
  if (weeks >= 4 && testsPerWeek >= 3) {
    bonus -= 1; // Consistent testing = -1 year
  }

  // All 3 hormones in optimal range
  const cortisolOptimal = checkHormoneOptimal(tests, 'cortisol', age, gender);
  const testosteroneOptimal = checkHormoneOptimal(tests, 'testosterone', age, gender);
  const dheaOptimal = checkHormoneOptimal(tests, 'dhea', age, gender);

  if (cortisolOptimal && testosteroneOptimal && dheaOptimal) {
    bonus -= 1; // Triple optimal = -1 year
  }

  // Multi-hormone dysregulation penalty
  let severelyOffCount = 0;
  if (!cortisolOptimal) severelyOffCount++;
  if (!testosteroneOptimal) severelyOffCount++;
  if (!dheaOptimal) severelyOffCount++;

  if (severelyOffCount >= 2) {
    bonus += 1; // 2+ severely off = +1 year
  }

  return bonus;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getHormoneRange(
  ranges: { male: HormoneRange[]; female: HormoneRange[] },
  age: number,
  gender: 'male' | 'female'
): HormoneRange {
  const genderRanges = ranges[gender];
  return genderRanges.find(r => age >= r.minAge && age <= r.maxAge) || genderRanges[0];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getWeeksCovered(tests: HormoneTest[]): number {
  if (tests.length === 0) return 0;
  const timestamps = tests.map(t => new Date(t.timestamp).getTime());
  const earliest = Math.min(...timestamps);
  const latest = Math.max(...timestamps);
  return (latest - earliest) / (7 * 24 * 60 * 60 * 1000);
}

function getMonthsCovered(tests: HormoneTest[]): number {
  if (tests.length === 0) return 0;
  const timestamps = tests.map(t => new Date(t.timestamp).getTime());
  const earliest = Math.min(...timestamps);
  const latest = Math.max(...timestamps);
  return (latest - earliest) / (30 * 24 * 60 * 60 * 1000);
}

function calculateDeclineRate(tests: HormoneTest[]): number {
  if (tests.length < 2) return 0;
  const sorted = [...tests].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const monthsCovered = getMonthsCovered(sorted);
  if (monthsCovered === 0) return 0;
  const annualizedDecline = ((first - last) / first) * (12 / monthsCovered) * 100;
  return annualizedDecline;
}

function checkHormoneOptimal(
  tests: HormoneTest[],
  hormoneType: 'cortisol' | 'testosterone' | 'dhea',
  age: number,
  gender: 'male' | 'female'
): boolean {
  const hormoneTests = tests.filter(t => t.hormone_type === hormoneType);
  if (hormoneTests.length === 0) return false;

  const rangesMap = {
    cortisol: CORTISOL_RANGES,
    testosterone: TESTOSTERONE_RANGES,
    dhea: DHEA_RANGES,
  };

  const range = getHormoneRange(rangesMap[hormoneType], age, gender);
  const avgValue = average(hormoneTests.map(t => t.value));

  return avgValue >= range.min && avgValue <= range.max;
}

function checkUnlockRequirements(tests: HormoneTest[]): boolean {
  if (tests.length < 10) return false;

  const timestamps = tests.map(t => new Date(t.timestamp).getTime());
  const earliest = Math.min(...timestamps);
  const latest = Math.max(...timestamps);
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

  return (latest - earliest) >= twoWeeksMs;
}

function calculateBioAgeConfidence(tests: HormoneTest[]): 'high' | 'medium' | 'low' {
  const totalTests = tests.length;
  const weeks = getWeeksCovered(tests);

  // Count how many hormones have been tested
  const hormonesTestedSet = new Set(tests.map(t => t.hormone_type));
  const hormonesCount = hormonesTestedSet.size;

  // High confidence requirements
  if (totalTests >= 40 && weeks >= 8 && hormonesCount === 3) {
    return 'high'; // ✅
  }

  // Medium confidence
  if (totalTests >= 20 && weeks >= 4 && hormonesCount >= 2) {
    return 'medium'; // 🟡
  }

  // Low confidence
  return 'low'; // 🔴
}

function getPercentileRanking(delta: number): { ranking: number; message: string; emoji: string } {
  if (delta >= 12) return { ranking: 98, message: 'Elite optimizer', emoji: '🏆' };
  if (delta >= 8) return { ranking: 90, message: 'Exceptional', emoji: '🌟' };
  if (delta >= 5) return { ranking: 75, message: 'Above average', emoji: '💪' };
  if (delta >= 2) return { ranking: 60, message: 'Doing well', emoji: '👍' };
  if (delta >= -2) return { ranking: 50, message: 'Average range', emoji: '📊' };
  if (delta >= -5) return { ranking: 40, message: 'Room for improvement', emoji: '📈' };
  if (delta >= -8) return { ranking: 25, message: 'Needs attention', emoji: '⚠️' };
  return { ranking: 10, message: 'Urgent optimization needed', emoji: '🔴' };
}

// ============================================
// DISPLAY HELPERS
// ============================================

export function getBioAgeColor(delta: number): string {
  if (delta >= 5) return '#10B981';  // Significantly younger: Green
  if (delta >= 2) return '#3B82F6';  // Younger: Blue
  if (delta >= -2) return '#F59E0B'; // Same: Yellow
  if (delta >= -5) return '#FB923C'; // Older: Orange
  return '#EF4444';                   // Significantly older: Red
}

export function getBioAgeMessage(delta: number): string {
  if (delta >= 10) return 'Exceptional! 🌟';
  if (delta >= 5) return 'Great work! 🎉';
  if (delta >= 2) return 'Looking good! ✨';
  if (delta >= -2) return 'On track 👍';
  if (delta >= -5) return 'Room to improve ⚠️';
  return 'Focus on optimization 💪';
}

export async function saveBioAge(
  supabase: any,
  userId: string,
  bioAgeData: BioAgeCalculation
): Promise<void> {
  if (!bioAgeData.can_calculate) return;

  await supabase.from('bio_ages').insert({
    user_id: userId,
    chronological_age: bioAgeData.chronological_age,
    biological_age: bioAgeData.biological_age,
    delta: bioAgeData.delta,
    confidence: bioAgeData.confidence,
    breakdown: bioAgeData.breakdown,
  });
}
