import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardFlipWrapper } from './CardFlipWrapper';
import { calculateReadyScore, getReadyColor, getReadyEmoji, getReadyMessage } from '@/lib/ready';
import { HormoneTest } from '@/types';
import { DesignSystem } from '@/constants/DesignSystem';
import { AccuracyBadge, calculateAccuracyLevel, getAccuracyRequirements } from './AccuracyBadge';
import { LinearGradient } from 'expo-linear-gradient';

interface FlippableReadyCardProps {
  tests: HormoneTest[];
  userGender: 'male' | 'female' | 'other';
}

export function FlippableReadyCard({ tests, userGender }: FlippableReadyCardProps) {
  const readyData = calculateReadyScore(tests, userGender);
  const uniqueDays = new Set(tests.map((t) => new Date(t.timestamp).toDateString())).size;
  const requirements = getAccuracyRequirements('readyscore');
  const accuracyLevel = calculateAccuracyLevel(tests.length, uniqueDays, requirements);

  if (!readyData.can_calculate) {
    // Return locked state (non-flippable)
    return (
      <View style={styles.card}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedTitle}>READYSCORE™</Text>
        <Text style={styles.lockedSubtitle}>
          {readyData.tests_needed} more test{readyData.tests_needed !== 1 ? 's' : ''} this week
        </Text>
      </View>
    );
  }

  const color = getReadyColor(readyData.score);
  const emoji = getReadyEmoji(readyData.score);
  const message = getReadyMessage(readyData.score);

  const gradient =
    readyData.score >= 75
      ? DesignSystem.colors.gradients.success
      : readyData.score >= 50
      ? DesignSystem.colors.gradients.ocean
      : DesignSystem.colors.gradients.warning;

  // Front Content
  const frontContent = (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.frontCard}>
      <View style={styles.frontHeader}>
        <Text style={styles.frontLabel}>READYSCORE™</Text>
        <AccuracyBadge level={accuracyLevel} size="sm" showLabel={false} testCount={tests.length} />
      </View>
      <Text style={styles.frontEmoji}>{emoji}</Text>
      <Text style={styles.frontValue}>{readyData.score}</Text>
      <Text style={styles.frontSubtext}>/100</Text>
      <View style={[styles.frontBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
        <Text style={styles.frontBadgeText}>{readyData.level.toUpperCase()}</Text>
      </View>
      <Text style={styles.frontTapHint}>Tap to see breakdown →</Text>
    </LinearGradient>
  );

  // Back Content
  const backContent = (
    <View style={styles.backCard}>
      <Text style={styles.backTitle}>READY Breakdown</Text>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Today's Score</Text>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryScore, { color }]}>{readyData.score}/100</Text>
          <Text style={styles.summaryMessage}>{message}</Text>
        </View>
      </View>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Contributing Factors</Text>
        {[
          { label: 'Cortisol 💧', data: readyData.factors.cortisol, weight: '30%' },
          { label: 'Testosterone ⚡', data: readyData.factors.testosterone, weight: '25%' },
          { label: 'DHEA 🔥', data: readyData.factors.dhea, weight: '15%' },
          { label: 'Trend 📈', data: readyData.factors.trend, weight: '15%' },
          { label: 'Consistency 🎯', data: readyData.factors.consistency, weight: '15%' },
        ].map((item, index) => (
          <View key={index} style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorLabel}>{item.label}</Text>
              <Text style={styles.factorScore}>{item.data.score}/100</Text>
            </View>
            <View style={styles.factorBar}>
              <View
                style={[
                  styles.factorBarFill,
                  {
                    width: `${item.data.score}%`,
                    backgroundColor: getReadyColor(item.data.score),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {readyData.protocol.length > 0 && (
        <View style={styles.backSection}>
          <Text style={styles.backSectionTitle}>Today's Protocol</Text>
          {readyData.protocol.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.protocolItem}>
              <Text style={styles.protocolText}>• {item}</Text>
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
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -3,
    lineHeight: 72,
  },
  frontSubtext: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: DesignSystem.spacing[3],
  },
  frontBadge: {
    paddingHorizontal: DesignSystem.spacing[4],
    paddingVertical: DesignSystem.spacing[2],
    borderRadius: DesignSystem.radius.full,
    marginBottom: DesignSystem.spacing[2],
  },
  frontBadgeText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  frontTapHint: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: DesignSystem.spacing[3],
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
  summaryCard: {
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    alignItems: 'center',
  },
  summaryScore: {
    fontSize: DesignSystem.typography.fontSize['4xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    marginBottom: DesignSystem.spacing[2],
  },
  summaryMessage: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  factorItem: {
    marginBottom: DesignSystem.spacing[3],
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[2],
  },
  factorLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.primary,
  },
  factorScore: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.secondary,
  },
  factorBar: {
    height: 6,
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: DesignSystem.radius.full,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    borderRadius: DesignSystem.radius.full,
  },
  protocolItem: {
    marginBottom: DesignSystem.spacing[2],
  },
  protocolText: {
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

