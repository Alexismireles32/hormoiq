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
import { calculateReadyScore, getReadyColor, getReadyEmoji, getReadyMessage } from '@/lib/ready';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DesignSystem } from '@/constants/DesignSystem';
import { CircularProgress } from './ProgressBar';
import { router } from 'expo-router';
import { AccuracyBadge, calculateAccuracyLevel, getAccuracyRequirements, getAccuracyMessage } from './AccuracyBadge';
import { getReadyScoreContext } from '@/utils/readyScoreContext';

interface ReadyCardProps {
  tests: HormoneTest[];
  userGender: 'male' | 'female' | 'other';
}

export function ReadyCard({ tests, userGender }: ReadyCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const readyData = calculateReadyScore(tests, userGender);
  
  // Calculate accuracy level for progressive display
  const uniqueDays = new Set(tests.map(t => new Date(t.timestamp).toDateString())).size;
  const requirements = getAccuracyRequirements('readyscore');
  const accuracyLevel = calculateAccuracyLevel(tests.length, uniqueDays, requirements);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: `My READY score today: ${readyData.score}/100 ${getReadyEmoji(readyData.score)}\n\n${getReadyMessage(readyData.score)}\n\nTracking with HormoIQ`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewBreakdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBreakdown(true);
  };

  // Locked state with progress
  if (!readyData.can_calculate) {
    const testsThisWeek = tests.filter(test => {
      const testDate = new Date(test.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return testDate >= weekAgo;
    }).length;
    
    const requiredTests = 3;
    const progress = (testsThisWeek / requiredTests) * 100;

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

          <Text style={styles.lockedTitle}>READYSCORE™ Locked</Text>
          <Text style={styles.lockedProgress}>
            {testsThisWeek} of {requiredTests} tests this week
          </Text>
          <Text style={styles.lockedSubtitle}>
            {readyData.tests_needed} more test{readyData.tests_needed !== 1 ? 's' : ''} needed
          </Text>

          {/* What You'll Get Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>You'll unlock:</Text>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>⚡</Text>
              <Text style={styles.previewText}>Daily wellness score (0-100)</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>📈</Text>
              <Text style={styles.previewText}>Personalized recommendations</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>🎯</Text>
              <Text style={styles.previewText}>Readiness insights</Text>
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

  const color = getReadyColor(readyData.score);
  const emoji = getReadyEmoji(readyData.score);
  const message = getReadyMessage(readyData.score);
  
  // Get contextual information (100/100 UX Enhancement)
  const context = getReadyScoreContext(readyData.score);

  return (
    <>
      <TouchableOpacity 
        style={styles.card} 
        onPress={handleViewBreakdown}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.labelWithBadge}>
            <Text style={styles.label}>Your READY Score</Text>
            <AccuracyBadge 
              level={accuracyLevel}
              size="sm"
              showLabel={true}
              testCount={tests.length}
            />
          </View>
        </View>

        {/* Contextual Label + Percentile (100/100 UX) */}
        <View style={styles.contextHeader}>
          <Text style={[styles.contextLabel, { color: context.color }]}>
            {context.emoji} {context.label}
          </Text>
          <View style={[styles.percentileBadge, { backgroundColor: context.color + '20', borderColor: context.color }]}>
            <Text style={[styles.percentileText, { color: context.color }]}>
              {context.percentile}
            </Text>
          </View>
        </View>

        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <ProgressRing
            score={readyData.score}
            color={context.color}  // Dynamic color based on tier
            size={200}
            strokeWidth={16}
          />
          <View style={styles.scoreOverlay}>
            <Text style={styles.scoreNumber}>{readyData.score}</Text>
          </View>
        </View>

        {/* Contextual Message (100/100 UX) */}
        <Text style={styles.contextMessage}>{context.message}</Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Text style={styles.actionButtonText}>Share 📤</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewBreakdown}
          >
            <Text style={styles.actionButtonText}>Details →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Breakdown Modal */}
      <Modal
        visible={showBreakdown}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBreakdown(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>READY Breakdown</Text>
            <TouchableOpacity 
              onPress={() => setShowBreakdown(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Summary */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Today's Score</Text>
              <View style={[styles.summaryCard, { borderLeftColor: color }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryScore, { color }]}>
                    {readyData.score}/100
                  </Text>
                  <Text style={styles.summaryEmoji}>{emoji}</Text>
                </View>
                <Text style={styles.summaryMessage}>{message}</Text>
              </View>
            </View>

            {/* Contributing Factors */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Contributing Factors</Text>
              {[
                { 
                  label: 'Cortisol 💧', 
                  data: readyData.factors.cortisol,
                  weight: '30%'
                },
                { 
                  label: 'Testosterone ⚡', 
                  data: readyData.factors.testosterone,
                  weight: '25%'
                },
                { 
                  label: 'DHEA 🔥', 
                  data: readyData.factors.dhea,
                  weight: '15%'
                },
                { 
                  label: 'Trend 📈', 
                  data: readyData.factors.trend,
                  weight: '15%'
                },
                { 
                  label: 'Consistency 🎯', 
                  data: readyData.factors.consistency,
                  weight: '15%'
                },
              ].map((item, index) => (
                <View key={index} style={styles.factorItem}>
                  <View style={styles.factorHeader}>
                    <Text style={styles.factorLabel}>{item.label}</Text>
                    <Text style={styles.factorWeight}>{item.weight}</Text>
                  </View>
                  <View style={styles.factorBar}>
                    <View 
                      style={[
                        styles.factorBarFill,
                        { 
                          width: `${item.data.score}%`,
                          backgroundColor: getReadyColor(item.data.score)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.factorScore}>{item.data.score}/100</Text>
                  {'status' in item.data && (
                    <Text style={styles.factorStatus}>
                      Status: {item.data.status}
                      {item.data.hours_ago !== undefined && ` (${item.data.hours_ago}h ago)`}
                    </Text>
                  )}
                  {'direction' in item.data && (
                    <Text style={styles.factorStatus}>
                      Direction: {item.data.direction}
                    </Text>
                  )}
                  {'tests_this_week' in item.data && (
                    <Text style={styles.factorStatus}>
                      Tests this week: {item.data.tests_this_week}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Protocol */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Today's Protocol</Text>
              {readyData.protocol.map((item, index) => (
                <View key={index} style={styles.protocolItem}>
                  <Text style={styles.protocolText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * Progress Ring Component
 */
function ProgressRing({ 
  score, 
  color, 
  size = 200, 
  strokeWidth = 16 
}: { 
  score: number; 
  color: string; 
  size?: number; 
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      {/* Background circle - Subtle Oura style */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={DesignSystem.colors.oura.divider}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: DesignSystem.spacing[8],  // 32px
    borderRadius: DesignSystem.radius['2xl'],  // 24px
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    marginBottom: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,  // Subtle shadow
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[5],
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[4],
  },
  lockedTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.medium,  // Lighter
    marginBottom: DesignSystem.spacing[2],
    color: DesignSystem.colors.neutral[900],
  },
  lockedSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.relaxed,
  },
  lockedProgress: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[600],
    marginBottom: DesignSystem.spacing[2],
    marginTop: DesignSystem.spacing[4],
  },
  lockedHint: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    color: DesignSystem.colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
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
    marginBottom: 24,
  },
  labelWithBadge: {
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  label: {
    fontSize: 13,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    letterSpacing: 0.5,
  },
  // Contextual ReadyScore Styles (100/100 UX)
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contextLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  percentileBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  percentileText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contextMessage: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: DesignSystem.typography.fontWeight.regular,  // Lighter
    color: DesignSystem.colors.neutral[700],  // Darker text for soft backgrounds
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 72,  // Larger like Oura
    fontWeight: '200',  // Very thin
    color: DesignSystem.colors.primary[500],
  },
  scoreEmoji: {
    fontSize: 32,
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    color: DesignSystem.colors.neutral[800],
    marginBottom: 8,
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
  },
  levelLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: DesignSystem.colors.neutral[500],
    marginBottom: 20,
    fontWeight: DesignSystem.typography.fontWeight.regular,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  summaryScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  summaryEmoji: {
    fontSize: 40,
  },
  summaryMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  factorItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  factorWeight: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  factorBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  factorScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  factorStatus: {
    fontSize: 12,
    color: '#666',
  },
  protocolItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  protocolText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
  },
});

