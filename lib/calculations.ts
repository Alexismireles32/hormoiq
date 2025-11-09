/**
 * Calculation utilities for HormoIQ
 * Handles hormone analysis, averages, anomaly detection
 */

import { HormoneTest, HORMONE_RANGES } from '@/types';

export interface TestInsights {
  status: 'optimal' | 'borderline' | 'concerning';
  statusMessage: string;
  comparisonToAverage?: string;
  anomalyDetected?: boolean;
  anomalyMessage?: string;
  testCount: number;
  testCountMessage: string;
}

/**
 * Calculate insights from a hormone test
 */
export function calculateTestInsights(
  test: HormoneTest,
  previousTests: HormoneTest[],
  userGender: 'male' | 'female' | 'other' = 'male'
): TestInsights {
  const { hormone_type, value } = test;
  
  // Get optimal range
  const range = hormone_type === 'testosterone'
    ? HORMONE_RANGES.testosterone[userGender === 'female' ? 'female' : 'male']
    : HORMONE_RANGES[hormone_type];

  // Determine status
  let status: 'optimal' | 'borderline' | 'concerning';
  let statusMessage: string;

  if (value >= range.optimal_min && value <= range.optimal_max) {
    status = 'optimal';
    statusMessage = `Your ${hormone_type} of ${value} ${range.unit} is in the optimal range ✓`;
  } else if (
    (value >= range.optimal_min * 0.8 && value < range.optimal_min) ||
    (value > range.optimal_max && value <= range.optimal_max * 1.2)
  ) {
    status = 'borderline';
    if (value < range.optimal_min) {
      statusMessage = `Your ${hormone_type} is slightly below optimal at ${value} ${range.unit}`;
    } else {
      statusMessage = `Your ${hormone_type} is slightly above optimal at ${value} ${range.unit}`;
    }
  } else {
    status = 'concerning';
    if (value < range.optimal_min) {
      statusMessage = `Your ${hormone_type} is below optimal range at ${value} ${range.unit}`;
    } else {
      statusMessage = `Your ${hormone_type} is above optimal range at ${value} ${range.unit}`;
    }
  }

  // Calculate test count
  const sameHormoneTests = previousTests.filter(t => t.hormone_type === hormone_type);
  const testCount = sameHormoneTests.length + 1; // +1 for current test

  // Test count message
  let testCountMessage = `This is your first ${hormone_type} test! 🎉`;
  if (testCount === 2) {
    testCountMessage = `This is your 2nd ${hormone_type} test`;
  } else if (testCount === 3) {
    testCountMessage = `This is your 3rd ${hormone_type} test 🔥`;
  } else if (testCount > 3) {
    testCountMessage = `This is your ${testCount}th ${hormone_type} test 🔥`;
  }

  // Calculate average if there are previous tests
  let comparisonToAverage: string | undefined;
  let anomalyDetected = false;
  let anomalyMessage: string | undefined;

  if (sameHormoneTests.length >= 2) {
    const average = sameHormoneTests.reduce((sum, t) => sum + t.value, 0) / sameHormoneTests.length;
    const percentDiff = ((value - average) / average) * 100;

    if (Math.abs(percentDiff) > 5) {
      const direction = percentDiff > 0 ? 'higher' : 'lower';
      comparisonToAverage = `${Math.abs(Math.round(percentDiff))}% ${direction} than your average`;
    }

    // Anomaly detection (>40% deviation)
    if (Math.abs(percentDiff) > 40) {
      anomalyDetected = true;
      anomalyMessage = `This is ${Math.round(Math.abs(percentDiff))}% ${percentDiff > 0 ? 'higher' : 'lower'} than your usual. Everything okay?`;
    }
  }

  return {
    status,
    statusMessage,
    comparisonToAverage,
    anomalyDetected,
    anomalyMessage,
    testCount,
    testCountMessage,
  };
}

/**
 * Calculate personal average for a hormone type
 */
export function calculateAverage(tests: HormoneTest[]): number {
  if (tests.length === 0) return 0;
  const sum = tests.reduce((acc, test) => acc + test.value, 0);
  return sum / tests.length;
}

/**
 * Calculate tests this week
 */
export function getTestsThisWeek(tests: HormoneTest[]): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return tests.filter(test => {
    const testDate = new Date(test.timestamp);
    return testDate >= oneWeekAgo;
  }).length;
}

/**
 * Get time of day context
 */
export function getTimeOfDayContext(timestamp: string): string {
  const hour = new Date(timestamp).getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Detect if value is a personal record (high or low)
 */
export function detectPersonalRecord(
  value: number,
  previousTests: HormoneTest[]
): { isRecord: boolean; type?: 'highest' | 'lowest' } {
  if (previousTests.length === 0) {
    return { isRecord: false };
  }

  const values = previousTests.map(t => t.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);

  if (value > highest) {
    return { isRecord: true, type: 'highest' };
  } else if (value < lowest) {
    return { isRecord: true, type: 'lowest' };
  }

  return { isRecord: false };
}

