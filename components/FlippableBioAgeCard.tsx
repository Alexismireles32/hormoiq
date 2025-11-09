import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { CardFlipWrapper } from './CardFlipWrapper';
import { calculateBioAge, getBioAgeColor, getBioAgeMessage } from '@/lib/bioage';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import { AccuracyBadge, calculateAccuracyLevel, getAccuracyRequirements } from './AccuracyBadge';
import { LinearGradient } from 'expo-linear-gradient';

interface FlippableBioAgeCardProps {
  tests: HormoneTest[];
  chronologicalAge: number;
  userGender: 'male' | 'female' | 'other';
}

export function FlippableBioAgeCard({
  tests,
  chronologicalAge,
  userGender,
}: FlippableBioAgeCardProps) {
  const bioAgeData = calculateBioAge(tests, chronologicalAge, userGender);
  const uniqueDays = new Set(tests.map((t) => new Date(t.timestamp).toDateString())).size;
  const requirements = getAccuracyRequirements('bioage');
  const accuracyLevel = calculateAccuracyLevel(tests.length, uniqueDays, requirements);

  if (!bioAgeData.can_calculate) {
    // Return locked state (non-flippable)
    return (
      <View style={styles.card}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedTitle}>BIOAGE™</Text>
        <Text style={styles.lockedSubtitle}>
          {bioAgeData.tests_needed} more test{bioAgeData.tests_needed !== 1 ? 's' : ''} needed
        </Text>
      </View>
    );
  }

  const color = getBioAgeColor(bioAgeData.delta);
  const message = getBioAgeMessage(bioAgeData.delta);
  const gradient = bioAgeData.delta > 0 
    ? DesignSystem.colors.gradients.success 
    : bioAgeData.delta < -5 
    ? DesignSystem.colors.gradients.danger 
    : DesignSystem.colors.gradients.warning;

  // Front Content
  const frontContent = (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.frontCard}>
      <View style={styles.frontHeader}>
        <Text style={styles.frontLabel}>BIOAGE™</Text>
        <AccuracyBadge level={accuracyLevel} size="sm" showLabel={false} testCount={tests.length} />
      </View>
      <Text style={styles.frontValue}>{bioAgeData.biological_age}</Text>
      <Text style={styles.frontSubtext}>years old</Text>
      <View style={styles.frontDelta}>
        <Text style={styles.frontDeltaText}>
          {bioAgeData.delta > 0 ? '↓' : '↑'} {Math.abs(bioAgeData.delta)} years{' '}
          {bioAgeData.delta > 0 ? 'younger' : 'older'}
        </Text>
      </View>
      <Text style={styles.frontTapHint}>Tap to see details →</Text>
    </LinearGradient>
  );

  // Back Content
  const backContent = (
    <View style={styles.backCard}>
      <Text style={styles.backTitle}>BioAge Breakdown</Text>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAge}>{bioAgeData.biological_age} years</Text>
          <Text style={styles.summaryMessage}>{message}</Text>
        </View>
      </View>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Hormone Contributions</Text>
        {bioAgeData.hormone_contributions.map((contribution, index) => (
          <View key={index} style={styles.contributionItem}>
            <Text style={styles.contributionLabel}>{contribution.hormone}</Text>
            <Text
              style={[
                styles.contributionValue,
                { color: contribution.aging_effect > 0 ? '#ef4444' : '#10b981' },
              ]}
            >
              {contribution.aging_effect > 0 ? '+' : ''}
              {contribution.aging_effect.toFixed(1)} years
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.backSection}>
        <Text style={styles.backSectionTitle}>Top Recommendations</Text>
        {bioAgeData.recommendations.slice(0, 3).map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>• {rec}</Text>
          </View>
        ))}
      </View>

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
  frontValue: {
    fontSize: 64,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  frontSubtext: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignSystem.spacing[3],
  },
  frontDelta: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: DesignSystem.spacing[2],
    paddingHorizontal: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.full,
    marginTop: DesignSystem.spacing[2],
  },
  frontDeltaText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: '#FFFFFF',
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
  summaryCard: {
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    alignItems: 'center',
  },
  summaryAge: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[2],
  },
  summaryMessage: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: DesignSystem.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[100],
  },
  contributionLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.primary,
    textTransform: 'capitalize',
  },
  contributionValue: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
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

