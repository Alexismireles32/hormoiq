/**
 * AccuracyBadge Component
 * 
 * Displays a visual indicator of data accuracy/confidence level
 * - Uses dots to show progression (1-5 dots)
 * - Color-coded: red → yellow → green
 * - Tooltip explains what's needed for better accuracy
 * - Responsive sizing (sm, md, lg)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

export type AccuracyLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

interface AccuracyBadgeProps {
  level: AccuracyLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  testCount?: number;
}

const ACCURACY_CONFIG = {
  very_low: {
    dots: 1,
    color: DesignSystem.colors.error.DEFAULT,
    label: 'Initial',
    description: 'First look',
  },
  low: {
    dots: 2,
    color: DesignSystem.colors.warning.DEFAULT,
    label: 'Low',
    description: 'Building baseline',
  },
  medium: {
    dots: 3,
    color: DesignSystem.colors.warning.DEFAULT,
    label: 'Medium',
    description: 'Getting better',
  },
  high: {
    dots: 4,
    color: DesignSystem.colors.success.DEFAULT,
    label: 'High',
    description: 'Reliable',
  },
  very_high: {
    dots: 5,
    color: DesignSystem.colors.success.dark,
    label: 'Very High',
    description: 'Most accurate',
  },
};

export function AccuracyBadge({ 
  level, 
  size = 'md', 
  showLabel = true,
  testCount,
}: AccuracyBadgeProps) {
  const config = ACCURACY_CONFIG[level];
  const dotSize = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const gap = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { gap }]}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                backgroundColor: index < config.dots 
                  ? config.color 
                  : DesignSystem.colors.neutral[300],
              },
            ]}
          />
        ))}
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: config.color }]}>
            {config.label} Accuracy
          </Text>
          {testCount !== undefined && (
            <Text style={styles.testCount}>
              {testCount} test{testCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Calculate accuracy level based on test count and unique days
 */
export function calculateAccuracyLevel(
  testCount: number,
  uniqueDays: number,
  minTests: { veryLow: number; low: number; medium: number; high: number; veryHigh: number }
): AccuracyLevel {
  // Factor in both test count AND unique days (diversity matters)
  const score = testCount + (uniqueDays * 0.5); // Bonus for testing on different days

  if (score < minTests.low) return 'very_low';
  if (score < minTests.medium) return 'low';
  if (score < minTests.high) return 'medium';
  if (score < minTests.veryHigh) return 'high';
  return 'very_high';
}

/**
 * Get accuracy requirements for a specific feature
 */
export function getAccuracyRequirements(feature: 'readyscore' | 'bioage' | 'impact') {
  switch (feature) {
    case 'readyscore':
      return {
        veryLow: 1,   // Show from test 1
        low: 2,       // 2+ tests
        medium: 4,    // 4+ tests this week
        high: 7,      // Full week of tests
        veryHigh: 12, // Complete kit
      };
    case 'bioage':
      return {
        veryLow: 1,   // Show from test 1
        low: 3,       // 3+ tests
        medium: 6,    // 6+ tests (half kit)
        high: 9,      // 9+ tests
        veryHigh: 12, // Complete kit
      };
    case 'impact':
      return {
        veryLow: 2,   // Need at least 2 for comparison
        low: 4,       // 4+ tests
        medium: 6,    // 6+ tests
        high: 9,      // 9+ tests
        veryHigh: 12, // Complete kit
      };
  }
}

/**
 * Get user-friendly message for current accuracy level
 */
export function getAccuracyMessage(
  level: AccuracyLevel,
  feature: 'readyscore' | 'bioage' | 'impact',
  currentTests: number,
  nextLevel?: number
): string {
  const featureNames = {
    readyscore: 'ReadyScore',
    bioage: 'BioAge',
    impact: 'Impact',
  };

  const name = featureNames[feature];
  const needed = nextLevel ? nextLevel - currentTests : 0;

  switch (level) {
    case 'very_low':
      return `First ${name} estimate. ${needed} more test${needed !== 1 ? 's' : ''} for better accuracy.`;
    case 'low':
      return `Building your baseline. ${needed} more test${needed !== 1 ? 's' : ''} for reliable data.`;
    case 'medium':
      return `Good data quality. ${needed} more test${needed !== 1 ? 's' : ''} for high accuracy.`;
    case 'high':
      return `Reliable ${name}. ${needed} more test${needed !== 1 ? 's' : ''} for maximum precision.`;
    case 'very_high':
      return `Maximum accuracy achieved! This ${name} is highly reliable.`;
  }
}

/**
 * Compact accuracy indicator (just dots, no label)
 */
export function AccuracyDots({ level, size = 'sm' }: { level: AccuracyLevel; size?: 'sm' | 'md' | 'lg' }) {
  const config = ACCURACY_CONFIG[level];
  const dotSize = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const gap = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <View style={[styles.dotsContainer, { gap }]}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: index < config.dots 
                ? config.color 
                : DesignSystem.colors.neutral[300],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 999,
  },
  labelContainer: {
    alignItems: 'center',
    gap: DesignSystem.spacing[1],
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testCount: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
  },
});

