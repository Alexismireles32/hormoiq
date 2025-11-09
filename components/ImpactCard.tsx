import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import { calculateImpact, getImpactColor, getImpactEmoji, getImpactMessage } from '@/lib/impact';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import { CircularProgress } from './ProgressBar';
import { router } from 'expo-router';

interface ImpactCardProps {
  tests: HormoneTest[];
  userGender: 'male' | 'female' | 'other';
}

export function ImpactCard({ tests, userGender }: ImpactCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const impactData = calculateImpact(tests, userGender);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: `My hormone interventions are ${impactData.overall_trend}! Trend score: ${impactData.trend_score.toFixed(1)} 📊\n\nTracking with HormoIQ`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetails(true);
  };

  // Enhanced locked state with progress
  if (!impactData.can_calculate) {
    const requiredTests = 5;
    const progress = (tests.length / requiredTests) * 100;
    
    // Check if they have enough time span
    const sortedTests = [...tests].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const daysBetween = sortedTests.length >= 2
      ? Math.floor(
          (new Date(sortedTests[sortedTests.length - 1].timestamp).getTime() -
            new Date(sortedTests[0].timestamp).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    const needsMoreTime = tests.length >= 5 && daysBetween < 14;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/test/input');
        }}
        activeOpacity={0.8}
      >
        <View style={styles.lockedContainer}>
          {/* Progress Ring */}
          <CircularProgress
            progress={progress}
            size={140}
            strokeWidth={10}
            color={DesignSystem.colors.primary[500]}
            backgroundColor={DesignSystem.colors.neutral[200]}
            showPercentage={false}
          >
            <Text style={styles.lockIcon}>🔒</Text>
          </CircularProgress>

          <Text style={styles.lockedTitle}>IMPACT™ Locked</Text>
          <Text style={styles.lockedProgress}>
            {tests.length} of {requiredTests} tests
          </Text>
          <Text style={styles.lockedSubtitle}>
            {needsMoreTime 
              ? `Need tests over ${14 - daysBetween} more days (${daysBetween}/14 days)`
              : `${impactData.tests_needed} more test${impactData.tests_needed !== 1 ? 's' : ''} needed`
            }
          </Text>

          {/* What You'll Get Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>You'll unlock:</Text>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>📊</Text>
              <Text style={styles.previewText}>Track intervention effectiveness</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>📈</Text>
              <Text style={styles.previewText}>See which hormones are improving</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>🎯</Text>
              <Text style={styles.previewText}>Trend analysis over time</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>💡</Text>
              <Text style={styles.previewText}>Personalized insights & recommendations</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/test/input');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.unlockButtonText}>Log a Test</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const color = getImpactColor(impactData.overall_trend);
  const emoji = getImpactEmoji(impactData.overall_trend);
  const message = getImpactMessage(impactData.overall_trend);

  return (
    <>
      <TouchableOpacity 
        style={styles.card}
        onPress={handleViewDetails}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <Text style={styles.label}>IMPACT™ ANALYSIS</Text>
          <View style={styles.confidenceBadge}>
            <Text style={[styles.confidenceText, { color }]}>
              {impactData.confidence.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Trend Display */}
          <View style={styles.trendContainer}>
            <Text style={[styles.trendEmoji, { fontSize: 64 }]}>{emoji}</Text>
            <Text style={[styles.trendLabel, { color }]}>{impactData.overall_trend}</Text>
          </View>

          {/* Trend Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Trend Score</Text>
            <Text style={[styles.scoreValue, { color }]}>
              {impactData.trend_score > 0 ? '+' : ''}
              {impactData.trend_score.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Most Improved Hormone */}
        {impactData.most_improved_hormone && (
          <View style={styles.improvedSection}>
            <Text style={styles.improvedLabel}>Most Improved</Text>
            <Text style={styles.improvedHormone}>
              {impactData.most_improved_hormone.type.charAt(0).toUpperCase() + 
               impactData.most_improved_hormone.type.slice(1)}
            </Text>
            <Text style={styles.improvedPercent}>
              +{impactData.most_improved_hormone.improvement_percent.toFixed(1)}%
            </Text>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tests.length}</Text>
            <Text style={styles.statLabel}>Tests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{impactData.interventions_tracked}</Text>
            <Text style={styles.statLabel}>Interventions</Text>
          </View>
        </View>

        <Text style={styles.tapHint}>Tap for detailed analysis</Text>
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Impact Analysis</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDetails(false);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Overall Trend */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Overall Trend</Text>
              <View style={[styles.trendCard, { borderLeftColor: color }]}>
                <Text style={styles.trendCardEmoji}>{emoji}</Text>
                <View style={styles.trendCardContent}>
                  <Text style={[styles.trendCardTitle, { color }]}>
                    {impactData.overall_trend}
                  </Text>
                  <Text style={styles.trendCardScore}>
                    Trend Score: {impactData.trend_score > 0 ? '+' : ''}
                    {impactData.trend_score.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Key Insights */}
            {impactData.insights.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Key Insights</Text>
                {impactData.insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightBullet}>•</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Most Improved */}
            {impactData.most_improved_hormone && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Best Progress</Text>
                <View style={styles.improvedCard}>
                  <Text style={styles.improvedCardHormone}>
                    {impactData.most_improved_hormone.type.charAt(0).toUpperCase() + 
                     impactData.most_improved_hormone.type.slice(1)}
                  </Text>
                  <Text style={styles.improvedCardPercent}>
                    +{impactData.most_improved_hormone.improvement_percent.toFixed(1)}% improvement
                  </Text>
                  <Text style={styles.improvedCardTrend}>
                    Trend: {impactData.most_improved_hormone.trend}
                  </Text>
                </View>
              </View>
            )}

            {/* Data Quality */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Data Quality</Text>
              <View style={styles.qualityGrid}>
                <View style={styles.qualityItem}>
                  <Text style={styles.qualityValue}>{tests.length}</Text>
                  <Text style={styles.qualityLabel}>Total Tests</Text>
                </View>
                <View style={styles.qualityItem}>
                  <Text style={styles.qualityValue}>{impactData.interventions_tracked}</Text>
                  <Text style={styles.qualityLabel}>With Context</Text>
                </View>
                <View style={styles.qualityItem}>
                  <Text style={[styles.qualityValue, { color }]}>
                    {impactData.confidence.toUpperCase()}
                  </Text>
                  <Text style={styles.qualityLabel}>Confidence</Text>
                </View>
              </View>
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share Progress</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius['2xl'],
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    marginBottom: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[5],
  },
  lockIcon: {
    fontSize: DesignSystem.iconSize['2xl'],
    marginBottom: DesignSystem.spacing[4],
  },
  lockedTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing[2],
    color: DesignSystem.colors.neutral[900],
  },
  lockedProgress: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[600],
    marginBottom: DesignSystem.spacing[2],
    marginTop: DesignSystem.spacing[4],
  },
  lockedSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
  previewSection: {
    width: '100%',
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    marginTop: DesignSystem.spacing[6],
    gap: DesignSystem.spacing[3],
  },
  previewTitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  previewIcon: {
    fontSize: DesignSystem.iconSize.sm,
  },
  previewText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    flex: 1,
  },
  unlockButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.full,
    marginTop: DesignSystem.spacing[6],
    minHeight: DesignSystem.touchTarget.comfortable,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.md,
  },
  unlockButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[6],
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    letterSpacing: 1,
  },
  confidenceBadge: {
    paddingHorizontal: DesignSystem.spacing[3],
    paddingVertical: DesignSystem.spacing[1],
    borderRadius: DesignSystem.radius.md,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
  },
  confidenceText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[6],
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendEmoji: {
    marginBottom: DesignSystem.spacing[2],
  },
  trendLabel: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.light,
    marginBottom: DesignSystem.spacing[1],
  },
  scoreValue: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
  message: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[700],
    fontWeight: DesignSystem.typography.fontWeight.light,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  improvedSection: {
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    marginBottom: DesignSystem.spacing[4],
    alignItems: 'center',
  },
  improvedLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  improvedHormone: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  improvedPercent: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: '#7FB5A5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignSystem.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.oura.divider,
    marginBottom: DesignSystem.spacing[2],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
  tapHint: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[400],
    fontWeight: DesignSystem.typography.fontWeight.light,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.oura.divider,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
  },
  modalTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[900],
  },
  closeButton: {
    width: DesignSystem.touchTarget.comfortable,
    height: DesignSystem.touchTarget.comfortable,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: DesignSystem.iconSize.md,
    color: DesignSystem.colors.neutral[600],
  },
  modalContent: {
    flex: 1,
    padding: DesignSystem.spacing[6],
  },
  detailSection: {
    marginBottom: DesignSystem.spacing[8],
  },
  detailSectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
  },
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
    borderLeftWidth: 4,
  },
  trendCardEmoji: {
    fontSize: DesignSystem.iconSize['2xl'],
    marginRight: DesignSystem.spacing[4],
  },
  trendCardContent: {
    flex: 1,
  },
  trendCardTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    textTransform: 'capitalize',
    marginBottom: DesignSystem.spacing[1],
  },
  trendCardScore: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[4],
  },
  insightBullet: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.primary[500],
    marginRight: DesignSystem.spacing[3],
  },
  insightText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[700],
    fontWeight: DesignSystem.typography.fontWeight.light,
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
  },
  improvedCard: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
    alignItems: 'center',
  },
  improvedCardHormone: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  improvedCardPercent: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: '#7FB5A5',
    marginBottom: DesignSystem.spacing[1],
  },
  improvedCardTrend: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.light,
    textTransform: 'capitalize',
  },
  qualityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
  },
  qualityItem: {
    alignItems: 'center',
  },
  qualityValue: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  qualityLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
  shareButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.xl,
    alignItems: 'center',
    marginTop: DesignSystem.spacing[4],
    marginBottom: DesignSystem.spacing[8],
    minHeight: DesignSystem.touchTarget.comfortable,
    ...DesignSystem.shadows.md,
  },
  shareButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
});

