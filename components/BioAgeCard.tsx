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
import { calculateBioAge, getBioAgeColor, getBioAgeMessage } from '@/lib/bioage';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import { CircularProgress } from './ProgressBar';
import { router } from 'expo-router';
import { AccuracyBadge, calculateAccuracyLevel, getAccuracyRequirements } from './AccuracyBadge';

interface BioAgeCardProps {
  tests: HormoneTest[];
  chronologicalAge: number;
  userGender: 'male' | 'female' | 'other';
}

export function BioAgeCard({ tests, chronologicalAge, userGender }: BioAgeCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const bioAgeData = calculateBioAge(tests, chronologicalAge, userGender);
  
  // Calculate accuracy level for progressive display
  const uniqueDays = new Set(tests.map(t => new Date(t.timestamp).toDateString())).size;
  const requirements = getAccuracyRequirements('bioage');
  const accuracyLevel = calculateAccuracyLevel(tests.length, uniqueDays, requirements);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: `My BioAge: ${bioAgeData.biological_age} years old! (I'm actually ${bioAgeData.chronological_age}, so I'm ${Math.abs(bioAgeData.delta)} years ${bioAgeData.delta > 0 ? 'younger' : 'older'} biologically) 🎯\n\nTracking with HormoIQ`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewBreakdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBreakdown(true);
  };

  // Enhanced locked state with progress
  if (!bioAgeData.can_calculate) {
    const requiredTests = 10;
    const progress = (tests.length / requiredTests) * 100;
    
    // Check if they have enough tests over enough days
    const uniqueDays = new Set(
      tests.map(test => new Date(test.timestamp).toDateString())
    ).size;
    const needsMoreDays = uniqueDays < 7;

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

          <Text style={styles.lockedTitle}>BIOAGE™ Locked</Text>
          <Text style={styles.lockedProgress}>
            {tests.length} of {requiredTests} tests
          </Text>
          <Text style={styles.lockedSubtitle}>
            {needsMoreDays 
              ? `Need tests over ${7 - uniqueDays} more days (${uniqueDays}/7 days)`
              : `${bioAgeData.tests_needed} more test${bioAgeData.tests_needed !== 1 ? 's' : ''} needed`
            }
          </Text>

          {/* What You'll Get Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>You'll unlock:</Text>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>🧬</Text>
              <Text style={styles.previewText}>Your biological age estimate</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>📊</Text>
              <Text style={styles.previewText}>Age comparison vs chronological</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>📈</Text>
              <Text style={styles.previewText}>Track aging trends over time</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>🎯</Text>
              <Text style={styles.previewText}>Hormone optimization insights</Text>
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

  // Use soft monotone colors instead of bright colors
  const deltaColor = bioAgeData.delta >= 5 ? '#7FB5A5' :  // Soft green
                     bioAgeData.delta >= 2 ? '#8E9FBC' :   // Soft blue
                     bioAgeData.delta >= -2 ? '#D4A574' :  // Soft amber
                     bioAgeData.delta >= -5 ? '#C4A6A6' :  // Soft rose
                     '#D88B8B';  // Soft red
  const message = getBioAgeMessage(bioAgeData.delta);

  return (
    <>
      <TouchableOpacity 
        style={styles.card}
        onPress={handleViewBreakdown}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.labelWithBadge}>
            <Text style={styles.label}>Your BioAge</Text>
            <AccuracyBadge 
              level={accuracyLevel}
              size="sm"
              showLabel={true}
              testCount={tests.length}
            />
          </View>
        </View>

        <View style={styles.ageDisplay}>
          <Text style={styles.bioAge}>
            {bioAgeData.biological_age}
          </Text>
          <Text style={styles.yearsLabel}>years old</Text>
        </View>

        <View style={styles.comparison}>
          <Text style={styles.comparisonText}>
            Chronological age: {bioAgeData.chronological_age}
          </Text>
          <Text style={[styles.delta, { color: deltaColor }]}>
            {bioAgeData.delta > 0 && '+'}
            {bioAgeData.delta} years {bioAgeData.delta >= 0 ? 'younger' : 'older'} {message}
          </Text>
        </View>

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
            <Text style={styles.modalTitle}>BioAge Breakdown</Text>
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
              <Text style={styles.modalSectionTitle}>Summary</Text>
              <View style={styles.summaryCard}>
                <Text style={[styles.modalBioAge, { color: deltaColor }]}>
                  {bioAgeData.biological_age}
                </Text>
                <Text style={styles.modalCompare}>
                  vs {bioAgeData.chronological_age} actual
                </Text>
                <Text style={[styles.modalDelta, { color: deltaColor }]}>
                  {bioAgeData.delta > 0 ? '+' : ''}{bioAgeData.delta} years
                </Text>
                <Text style={styles.modalMessage}>{message}</Text>
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>What Contributes</Text>
              {[
                { label: 'Cortisol 💧', value: bioAgeData.breakdown.cortisol_years },
                { label: 'Testosterone ⚡', value: bioAgeData.breakdown.testosterone_years },
                { label: 'DHEA 🔥', value: bioAgeData.breakdown.dhea_years },
                { label: 'Cortisol/DHEA Ratio ⚖️', value: bioAgeData.breakdown.ratio_years },
                { label: 'Behavior Bonus 🎯', value: bioAgeData.breakdown.behavior_bonus },
              ].map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={[
                    styles.breakdownValue,
                    { color: item.value < 0 ? '#10B981' : item.value > 0 ? '#EF4444' : '#666' }
                  ]}>
                    {item.value > 0 ? '+' : ''}{item.value} {item.value === 1 || item.value === -1 ? 'year' : 'years'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Explanation */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>How It Works</Text>
              <Text style={styles.explanationText}>
                Your BioAge is calculated based on how consistently your hormones stay in optimal ranges:
              </Text>
              <Text style={styles.bulletPoint}>
                • 80%+ tests optimal: Ages you backwards
              </Text>
              <Text style={styles.bulletPoint}>
                • 40-80% tests optimal: Neutral
              </Text>
              <Text style={styles.bulletPoint}>
                • &lt;40% tests optimal: Ages you forwards
              </Text>
              <Text style={styles.bulletPoint}>
                • Improving trend: Bonus (-0.5 years)
              </Text>
              <Text style={styles.bulletPoint}>
                • Consistent testing: Bonus (-1 year)
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E9EC',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
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
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelWithBadge: {
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  label: {
    fontSize: 13,
    color: '#9B9DA2',
    fontWeight: '300',  // Light weight
    letterSpacing: 0.5,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '400',  // Regular weight
    color: '#374151',  // Darker for soft backgrounds
  },
  ageDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bioAge: {
    fontSize: 56,  // Slightly smaller
    fontWeight: '200',  // Very thin like Oura
    color: '#9B8DC7',  // Soft purple
  },
  yearsLabel: {
    fontSize: 15,
    fontWeight: '300',  // Light weight
    color: '#6B7280',
    marginTop: 4,
  },
  comparison: {
    alignItems: 'center',
    marginBottom: 20,
  },
  comparisonText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  delta: {
    fontSize: 18,
    fontWeight: '600',
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
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  modalBioAge: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalCompare: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalDelta: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    marginLeft: 8,
  },
});

