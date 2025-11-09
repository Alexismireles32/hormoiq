import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface FirstTestTutorialProps {
  visible: boolean;
  onClose: () => void;
  onStartTest: () => void;
}

export function FirstTestTutorial({ visible, onClose, onStartTest }: FirstTestTutorialProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      emoji: '🧪',
      title: 'How to Use Your Test Strip',
      steps: [
        'Wait 30 minutes after eating or drinking',
        'Collect saliva in your mouth for 2-3 minutes',
        'Apply saliva to the test strip',
        'Wait for the reading (usually 5-10 minutes)',
      ],
      tip: 'Best time to test: Morning (7-9 AM) for cortisol, or follow your kit instructions',
    },
    {
      emoji: '📊',
      title: 'Reading Your Results',
      steps: [
        'Look at the measurement line on the strip',
        'Compare with the reference chart',
        'Note the value (e.g., "5.2 ng/mL")',
        'Input this number into the app',
      ],
      tip: 'Take a photo of your test strip for future reference',
    },
    {
      emoji: '💡',
      title: 'Getting the Best Results',
      steps: [
        'Test at the same time each day',
        'Add context (sleep, stress, exercise)',
        'Track consistently for better insights',
        'Don\'t worry about perfection - just start!',
      ],
      tip: 'The more tests you log, the more accurate your insights become',
    },
  ];

  const currentPageData = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLastPage) {
      onStartTest();
      onClose();
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPage(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleSkip}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>First Test Guide</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Emoji */}
          <Text style={styles.emoji}>{currentPageData.emoji}</Text>

          {/* Title */}
          <Text style={styles.title}>{currentPageData.title}</Text>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {currentPageData.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipLabel}>Pro Tip</Text>
              <Text style={styles.tipText}>{currentPageData.tip}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Page indicators */}
          <View style={styles.indicators}>
            {pages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentPage && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.navigation}>
            {currentPage > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLastPage ? 'Log My First Test 🚀' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.oura.cardBorder,
  },
  skipButton: {
    padding: DesignSystem.spacing[2],
  },
  skipText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[10],
    alignItems: 'center',
  },
  emoji: {
    fontSize: DesignSystem.iconSize['3xl'] * 1.5,
    marginBottom: DesignSystem.spacing[6],
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[8],
    paddingHorizontal: DesignSystem.spacing[4],
  },
  stepsContainer: {
    width: '100%',
    marginBottom: DesignSystem.spacing[8],
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing[5],
    paddingHorizontal: DesignSystem.spacing[4],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing[4],
    ...DesignSystem.shadows.sm,
  },
  stepNumberText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  stepText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    paddingTop: 4,
  },
  tipContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.info.light,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.info.DEFAULT,
  },
  tipIcon: {
    fontSize: DesignSystem.iconSize.lg,
    marginRight: DesignSystem.spacing[3],
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  tipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
  footer: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.oura.cardBorder,
    paddingHorizontal: DesignSystem.spacing[6],
    paddingVertical: DesignSystem.spacing[6],
    paddingBottom: DesignSystem.spacing[8],
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignSystem.spacing[2],
    marginBottom: DesignSystem.spacing[6],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[300],
  },
  indicatorActive: {
    backgroundColor: DesignSystem.colors.primary[500],
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: DesignSystem.spacing[3],
  },
  backButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  nextButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.full,
    minHeight: DesignSystem.touchTarget.comfortable,
    justifyContent: 'center',
    ...DesignSystem.shadows.md,
  },
  nextButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
});

