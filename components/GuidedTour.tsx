import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export interface TourStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface GuidedTourProps {
  visible: boolean;
  onComplete: () => void;
  steps: TourStep[];
}

export function GuidedTour({ visible, onComplete, steps }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleComplete();
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentStep(0);
    onComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip Tour</Text>
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          {/* Step indicator */}
          <Text style={styles.stepIndicator}>
            Step {currentStep + 1} of {steps.length}
          </Text>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.emoji}>{step.emoji}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>

            {/* Optional action button */}
            {step.action && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  step.action!.onPress();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>{step.action.label}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentStep > 0 && (
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
                {isLastStep ? 'Get Started 🚀' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Page indicators */}
          <View style={styles.indicators}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Default tour steps for post-onboarding
export const defaultTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to HormoIQ!',
    description: 'Track your hormone levels and optimize your wellness journey. Let\'s take a quick tour to get you started.',
    emoji: '👋',
  },
  {
    id: 'test',
    title: 'Log Your First Test',
    description: 'Use your saliva hormone test strips to measure cortisol, testosterone, or DHEA. Then input the results here to start tracking.',
    emoji: '🧪',
    action: {
      label: 'See How to Log a Test',
      onPress: () => {
        // Will be handled by parent component
      },
    },
  },
  {
    id: 'features',
    title: 'Unlock Powerful Insights',
    description: 'As you log more tests, you\'ll unlock READYSCORE™, BIOAGE™, and IMPACT™ analysis. Each feature helps you understand your hormonal health better.',
    emoji: '🔓',
  },
  {
    id: 'consistency',
    title: 'Consistency is Key',
    description: 'Track regularly to see trends and patterns. The more data you log, the more accurate your insights become.',
    emoji: '📊',
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start your journey to optimal hormonal health. Remember: small consistent actions lead to big results.',
    emoji: '🎯',
  },
];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius['2xl'],
    padding: DesignSystem.spacing[6],
    ...DesignSystem.shadows.lg,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: DesignSystem.spacing[2],
    marginBottom: DesignSystem.spacing[2],
  },
  skipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  progressContainer: {
    height: 4,
    backgroundColor: DesignSystem.colors.neutral[200],
    borderRadius: DesignSystem.radius.full,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing[2],
  },
  progressBar: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.radius.full,
  },
  stepIndicator: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[6],
    letterSpacing: 0.5,
  },
  content: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[8],
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
    marginBottom: DesignSystem.spacing[3],
  },
  description: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    paddingHorizontal: DesignSystem.spacing[2],
  },
  actionButton: {
    marginTop: DesignSystem.spacing[6],
    backgroundColor: DesignSystem.colors.primary[50],
    paddingVertical: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[200],
  },
  actionButtonText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[700],
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignSystem.spacing[6],
    marginBottom: DesignSystem.spacing[4],
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
    paddingVertical: DesignSystem.spacing[3],
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
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignSystem.spacing[2],
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
});

