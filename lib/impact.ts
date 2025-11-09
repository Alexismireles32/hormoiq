import { HormoneTest } from '@/types';

export interface ImpactAnalysis {
  can_calculate: boolean;
  tests_needed: number;
  most_improved_hormone?: {
    type: 'cortisol' | 'testosterone' | 'dhea';
    improvement_percent: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  overall_trend: 'improving' | 'stable' | 'declining';
  trend_score: number; // -100 to +100
  interventions_tracked: number;
  insights: string[];
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Calculate the impact of interventions based on hormone test history
 * Requires at least 5 tests over 2+ weeks to establish trends
 */
export function calculateImpact(
  tests: HormoneTest[],
  userGender: 'male' | 'female' | 'other'
): ImpactAnalysis {
  // Need minimum 5 tests to establish trends
  if (tests.length < 5) {
    return {
      can_calculate: false,
      tests_needed: 5 - tests.length,
      overall_trend: 'stable',
      trend_score: 0,
      interventions_tracked: 0,
      insights: [],
      confidence: 'low',
    };
  }

  // Check if tests span at least 2 weeks
  const sortedTests = [...tests].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const firstTest = new Date(sortedTests[0].timestamp);
  const lastTest = new Date(sortedTests[sortedTests.length - 1].timestamp);
  const daysBetween = Math.floor(
    (lastTest.getTime() - firstTest.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysBetween < 14) {
    return {
      can_calculate: false,
      tests_needed: 1, // Need more time, not necessarily more tests
      overall_trend: 'stable',
      trend_score: 0,
      interventions_tracked: 0,
      insights: ['Keep logging tests over a longer period for trend analysis'],
      confidence: 'low',
    };
  }

  // Group tests by hormone type
  const hormoneGroups: Record<string, HormoneTest[]> = {
    cortisol: tests.filter(t => t.hormone_type === 'cortisol'),
    testosterone: tests.filter(t => t.hormone_type === 'testosterone'),
    dhea: tests.filter(t => t.hormone_type === 'dhea'),
  };

  // Calculate trend for each hormone
  const hormoneTrends = Object.entries(hormoneGroups).map(([type, hormoneTests]) => {
    if (hormoneTests.length < 2) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...hormoneTests].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Get first 3 and last 3 tests for comparison
    const earlyTests = sorted.slice(0, Math.min(3, Math.floor(sorted.length / 2)));
    const recentTests = sorted.slice(-Math.min(3, Math.ceil(sorted.length / 2)));

    const earlyAvg = earlyTests.reduce((sum, t) => sum + t.value, 0) / earlyTests.length;
    const recentAvg = recentTests.reduce((sum, t) => sum + t.value, 0) / recentTests.length;

    const changePercent = ((recentAvg - earlyAvg) / earlyAvg) * 100;

    // Determine if improvement based on hormone-specific goals
    let isImprovement = false;
    if (type === 'cortisol') {
      // Lower cortisol is generally better (stress reduction)
      isImprovement = changePercent < 0;
    } else if (type === 'testosterone') {
      // Higher testosterone is generally better (within optimal range)
      isImprovement = changePercent > 0;
    } else if (type === 'dhea') {
      // Higher DHEA is generally better (vitality)
      isImprovement = changePercent > 0;
    }

    const trend = Math.abs(changePercent) < 5 
      ? 'stable' 
      : isImprovement 
        ? 'improving' 
        : 'declining';

    return {
      type: type as 'cortisol' | 'testosterone' | 'dhea',
      improvement_percent: Math.abs(changePercent),
      change_percent: changePercent,
      trend,
      isImprovement,
    };
  }).filter(Boolean);

  // Find most improved hormone
  const mostImproved = hormoneTrends
    .filter(t => t?.isImprovement)
    .sort((a, b) => (b?.improvement_percent || 0) - (a?.improvement_percent || 0))[0];

  // Calculate overall trend score
  const trendScore = hormoneTrends.reduce((sum, t) => {
    if (!t) return sum;
    return sum + (t.isImprovement ? t.improvement_percent : -t.improvement_percent);
  }, 0) / hormoneTrends.length;

  const overallTrend = trendScore > 5 
    ? 'improving' 
    : trendScore < -5 
      ? 'declining' 
      : 'stable';

  // Count interventions (tests with context data)
  const interventionsTracked = tests.filter(
    t => t.sleep_quality || t.exercise_level || t.stress_level || t.supplements
  ).length;

  // Generate insights
  const insights: string[] = [];
  
  if (mostImproved) {
    insights.push(
      `${mostImproved.type.charAt(0).toUpperCase() + mostImproved.type.slice(1)} improved by ${mostImproved.improvement_percent.toFixed(1)}%`
    );
  }

  if (overallTrend === 'improving') {
    insights.push('Your hormones are trending in a positive direction');
  } else if (overallTrend === 'declining') {
    insights.push('Consider adjusting your wellness interventions');
  }

  if (interventionsTracked < tests.length * 0.3) {
    insights.push('Add context to tests for better impact tracking');
  }

  // Confidence based on data quality
  const confidence = 
    tests.length >= 15 && daysBetween >= 30 && interventionsTracked >= 5
      ? 'high'
      : tests.length >= 10 && daysBetween >= 21 && interventionsTracked >= 3
        ? 'medium'
        : 'low';

  return {
    can_calculate: true,
    tests_needed: 0,
    most_improved_hormone: mostImproved ? {
      type: mostImproved.type,
      improvement_percent: mostImproved.improvement_percent,
      trend: mostImproved.trend,
    } : undefined,
    overall_trend: overallTrend,
    trend_score: trendScore,
    interventions_tracked: interventionsTracked,
    insights,
    confidence,
  };
}

export function getImpactColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '#7FB5A5'; // Soft green
    case 'stable':
      return '#8E9FBC'; // Soft blue
    case 'declining':
      return '#D88B8B'; // Soft red
  }
}

export function getImpactEmoji(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '📈';
    case 'stable':
      return '➡️';
    case 'declining':
      return '📉';
  }
}

export function getImpactMessage(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return 'Your interventions are working!';
    case 'stable':
      return 'Maintaining steady levels';
    case 'declining':
      return 'Time to adjust your approach';
  }
}

