import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardFlipWrapper } from './CardFlipWrapper';
import { calculateImpact, getImpactColor, getImpactEmoji, getImpactMessage } from '@/lib/impact';
import { HormoneTest } from '@/types';
import { DesignSystem } from '@/constants/DesignSystem';
import { AccuracyBadge, calculateAccuracyLevel, getAccuracyRequirements } from './AccuracyBadge';
import { LinearGradient } from 'expo-linear-gradient';

interface FlippableImpactCardProps {
  tests: HormoneTest[];
  userGender: 'male' | 'female' | 'other';
}

export function FlippableImpactCard({ tests, userGender }: FlippableImpactCardProps) {
  const impactData = calculateImpact(tests, userGender);
  const uniqueDays = new Set(tests.map((t) => new Date(t.timestamp).toDateString())).size;
  const requirements = getAccuracyRequirements('impact');
  const accuracyLevel = calculateAccuracyLevel(tests.length, uniqueDays, requirements);

  if (!impactData.can_calculate) {
    // Return locked state (non-flippable)
    return (
      <View style={styles.card}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedTitle}>IMPACT™</Text>
        <Text style={styles.lockedSubtitle}>
          {impactData.tests_needed} more test{impactData.tests_needed !== 1 ? 's' : ''} needed
        </Text>
      </View>
    );
  }

  const color = getImpactColor(impactData.trend_score);
  const emoji = getImpactEmoji(impactData.trend_score);
  const message = getImpactMessage(impactData.overall_trend);
  
  const gradient =
    impactData.overall_trend === 'improving'
      ? DesignSystem.colors.gradients.success
      : impactData.overall_trend === 'declining'
      ? DesignSystem.colors.gradients.danger
      : DesignSystem.colors.gradients.ocean;

  // Front Content
  const frontContent = (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.frontCard}>
      <View style={styles.frontHeader}>
        <Text style={styles.frontLabel}>IMPACT™</Text>
        <AccuracyBadge level={accuracyLevel} size="sm" showLabel={false} testCount={tests.length} />
      </View>
      <Text style={styles.frontEmoji}>{emoji}</Text>
      <Text style={styles.frontValue}>{impactData.trend_score.toFixed(0)}</Text>
      <Text style={styles.frontSubtext}>{impactData.overall_trend}</Text>
      <Text style={styles.frontMessage}>{message}</Text>
      <Text style={styles.frontTapHint}>Tap to see analysis →</Text>
    </LinearGradient>
  );

  // Back Content
  const backContent = (
    <View style={styles.backCard}>
      <Text style={styles.backTitle}>Impact Analysis</Text>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Overall Trend</Text>
        <View style={[styles.trendCard, { backgroundColor: `${color}20` }]}>
          <Text style={styles.trendEmoji}>{emoji}</Text>
          <Text style={[styles.trendText, { color }]}>{impactData.overall_trend.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Hormone Trends</Text>
        {impactData.hormone_trends.map((trend, index) => (
          <View key={index} style={styles.trendItem}>
            <Text style={styles.trendItemLabel}>{trend.hormone}</Text>
            <View style={styles.trendItemRight}>
              <Text
                style={[
                  styles.trendItemDirection,
                  {
                    color:
                      trend.direction === 'improving'
                        ? '#10b981'
                        : trend.direction === 'declining'
                        ? '#ef4444'
                        : '#6b7280',
                  },
                ]}
              >
                {trend.direction === 'improving' ? '↗' : trend.direction === 'declining' ? '↘' : '→'}
              </Text>
              <Text style={styles.trendItemPercent}>{trend.percent_change.toFixed(0)}%</Text>
            </View>
          </View>
        ))}
      </View>

      {impactData.factors_detected.length > 0 && (
        <View style={styles.backSection}>
          <Text style={styles.backSectionTitle}>Key Factors</Text>
          {impactData.factors_detected.slice(0, 3).map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <Text style={styles.factorText}>• {factor}</Text>
            </View>
          ))}
        </View>
      )}

      {impactData.recommendations.length > 0 && (
        <View style={styles.backSection}>
          <Text style={styles.backSectionTitle}>Recommendations</Text>
          {impactData.recommendations.slice(0, 2).map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• {rec}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.backTapHint}>Tap to flip back</Text>
    </View>
  );

  return <CardFlipWrapper frontContent={frontContent} backContent={backContent} style={styles.wrapper} />;
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 200,
  },
  card: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
    minHeight: 200,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[3],
  },
  lockedTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[2],
  },
  lockedSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  frontCard: {
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    ...DesignSystem.shadows.md,
  },
  frontHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
    marginBottom: DesignSystem.spacing[4],
  },
  frontLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  frontEmoji: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[2],
  },
  frontValue: {
    fontSize: 64,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  frontSubtext: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
    marginBottom: DesignSystem.spacing[2],
  },
  frontMessage: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: DesignSystem.spacing[4],
  },
  frontTapHint: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: DesignSystem.spacing[4],
  },
  backCard: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
    minHeight: 200,
  },
  backTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[5],
  },
  backSection: {
    marginBottom: DesignSystem.spacing[5],
  },
  backSectionTitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendCard: {
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignSystem.spacing[3],
  },
  trendEmoji: {
    fontSize: 32,
  },
  trendText: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[100],
  },
  trendItemLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.primary,
    textTransform: 'capitalize',
  },
  trendItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  trendItemDirection: {
    fontSize: 20,
  },
  trendItemPercent: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.secondary,
    minWidth: 50,
    textAlign: 'right',
  },
  factorItem: {
    marginBottom: DesignSystem.spacing[2],
  },
  factorText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.primary,
    lineHeight: DesignSystem.typography.lineHeight.relaxed,
  },
  recommendationItem: {
    marginBottom: DesignSystem.spacing[2],
  },
  recommendationText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.primary,
    lineHeight: DesignSystem.typography.lineHeight.relaxed,
  },
  backTapHint: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing[4],
  },
});

