import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export type FeatureType = 'test' | 'readyscore' | 'bioage' | 'impact' | 'ask' | 'protocols';

interface FeatureExplainerProps {
  visible: boolean;
  feature: FeatureType;
  onClose: () => void;
}

const FEATURE_CONTENT = {
  test: {
    icon: '🧪',
    name: 'TEST™',
    tagline: 'Track Your Hormone Levels',
    description: 'Log your saliva hormone test results and add important context like sleep quality, exercise, and stress levels.',
    benefits: [
      {
        icon: '📊',
        title: 'Track Patterns',
        text: 'See how your hormone levels change over time and identify trends.',
      },
      {
        icon: '🎯',
        title: 'Add Context',
        text: 'Record daily factors that may influence your hormone levels.',
      },
      {
        icon: '💡',
        title: 'Get Insights',
        text: 'Receive immediate feedback on how your results compare to optimal ranges.',
      },
    ],
    howToUse: 'After testing with your HormoIQ saliva strips, simply input your results. Add context about your day to help identify what affects your levels.',
    improvement: 'Regular testing helps you understand your unique hormone patterns and make informed wellness decisions.',
    disclaimer: 'For general wellness purposes only. Not intended to diagnose, treat, cure, or prevent any disease.',
  },
  readyscore: {
    icon: '⚡',
    name: 'READYSCORE™',
    tagline: 'Your Daily Wellness Number',
    description: 'A personalized score (0-100) that reflects your current state based on your recent hormone tests and daily context.',
    benefits: [
      {
        icon: '🎯',
        title: 'Daily Guidance',
        text: 'Understand if today is a high-performance day or a recovery day.',
      },
      {
        icon: '📈',
        title: 'Track Progress',
        text: 'See how your score improves as you optimize your lifestyle.',
      },
      {
        icon: '🧠',
        title: 'Smart Recommendations',
        text: 'Get personalized suggestions based on your current score.',
      },
    ],
    howToUse: 'Check your READYSCORE each morning after logging a test. Scores above 80 indicate optimal readiness, while lower scores suggest focusing on recovery.',
    improvement: 'Use your score to adjust your daily activities—intense workouts on high days, rest and recovery on low days.',
    disclaimer: 'Educational wellness tool. Not medical advice. Consult healthcare providers for health decisions.',
  },
  bioage: {
    icon: '🧬',
    name: 'BIOAGE™',
    tagline: 'Your Biological Age Estimate',
    description: 'An estimate of your biological age based on your hormone patterns compared to age-adjusted optimal ranges.',
    benefits: [
      {
        icon: '⏱️',
        title: 'Age Comparison',
        text: 'See how your hormone profile compares to your chronological age.',
      },
      {
        icon: '📊',
        title: 'Track Changes',
        text: 'Monitor how your biological age estimate changes over time.',
      },
      {
        icon: '🎯',
        title: 'Set Goals',
        text: 'Work towards maintaining optimal hormone patterns.',
      },
    ],
    howToUse: 'After logging at least 5 tests over 7 days, BIOAGE™ calculates an estimate based on your hormone patterns, trends, and consistency.',
    improvement: 'Optimize your hormone levels through lifestyle changes and track how your biological age estimate responds.',
    disclaimer: 'Wellness estimate only, not a medical diagnosis. Based on hormone patterns, not comprehensive health markers.',
  },
  impact: {
    icon: '🎯',
    name: 'IMPACT™',
    tagline: 'Discover What Works for You',
    description: 'Analyzes your data to identify which interventions (supplements, habits, lifestyle changes) correlate with better hormone levels.',
    benefits: [
      {
        icon: '🔬',
        title: 'Pattern Detection',
        text: 'Automatically identifies correlations between your habits and hormone levels.',
      },
      {
        icon: '✨',
        title: 'Personalized Insights',
        text: 'Discover what specifically works for YOUR biology, not generic advice.',
      },
      {
        icon: '📈',
        title: 'Track Effectiveness',
        text: 'See the measured impact of your wellness interventions.',
      },
    ],
    howToUse: 'After 10+ tests with varied context, IMPACT™ analyzes your patterns to show which factors correlate with your best hormone levels.',
    improvement: 'Stop guessing what works. IMPACT™ shows you data-driven insights specific to your body.',
    disclaimer: 'Shows correlations, not causation. For informational wellness purposes only, not medical recommendations.',
  },
  ask: {
    icon: '🤖',
    name: 'ASK™',
    tagline: 'Your AI Wellness Coach',
    description: 'Chat with an AI trained on hormone optimization research to get personalized wellness guidance based on your data.',
    benefits: [
      {
        icon: '💬',
        title: 'Instant Answers',
        text: 'Get quick responses to your hormone and wellness questions.',
      },
      {
        icon: '📊',
        title: 'Data-Aware',
        text: 'ASK™ analyzes your test history to provide context-specific guidance.',
      },
      {
        icon: '🎓',
        title: 'Research-Based',
        text: 'Trained on peer-reviewed hormone optimization research.',
      },
    ],
    howToUse: 'Ask anything about your results, lifestyle factors, or general hormone wellness. ASK™ provides educational information tailored to your situation.',
    improvement: 'Get 24/7 access to evidence-based wellness information without waiting for appointments.',
    disclaimer: 'Educational information only. Not medical advice. Always consult qualified healthcare professionals for health concerns.',
  },
  protocols: {
    icon: '📋',
    name: 'Protocols',
    tagline: 'Guided Wellness Plans',
    description: 'Follow structured plans designed to support hormone optimization through lifestyle modifications.',
    benefits: [
      {
        icon: '📝',
        title: 'Step-by-Step',
        text: 'Clear daily actions to support your hormone wellness.',
      },
      {
        icon: '✓',
        title: 'Track Compliance',
        text: 'Log your adherence and see how it correlates with your results.',
      },
      {
        icon: '🎯',
        title: 'Targeted Support',
        text: 'Choose protocols for sleep, stress, energy, and more.',
      },
    ],
    howToUse: 'Select a protocol that matches your wellness goals. Follow the daily recommendations and track your progress.',
    improvement: 'Structured guidance makes it easier to implement effective wellness habits consistently.',
    disclaimer: 'General wellness recommendations. Not medical treatment plans. Consult healthcare providers before starting new protocols.',
  },
};

export const FeatureExplainer: React.FC<FeatureExplainerProps> = ({
  visible,
  feature,
  onClose,
}) => {
  const content = FEATURE_CONTENT[feature];

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={DesignSystem.colors.gradients.primary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>{content.icon}</Text>
            <Text style={styles.headerTitle}>{content.name}</Text>
            <Text style={styles.headerTagline}>{content.tagline}</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is it?</Text>
            <Text style={styles.description}>{content.description}</Text>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Benefits</Text>
            {content.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitHeader}>
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          {/* How to Use */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Use</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{content.howToUse}</Text>
            </View>
          </View>

          {/* Real-Life Improvement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real-Life Impact</Text>
            <View style={[styles.infoCard, styles.highlightCard]}>
              <Text style={styles.infoText}>{content.improvement}</Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerIcon}>ℹ️</Text>
            <Text style={styles.disclaimerText}>{content.disclaimer}</Text>
          </View>
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <LinearGradient
              colors={DesignSystem.colors.gradients.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Got It! ✓</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  header: {
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[8],
    paddingHorizontal: DesignSystem.spacing[6],
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: DesignSystem.spacing[3],
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize['4xl'],
    fontWeight: DesignSystem.typography.fontWeight.extrabold,
    color: DesignSystem.colors.neutral[0],
    marginBottom: DesignSystem.spacing[2],
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  headerTagline: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.neutral[0],
    opacity: 0.9,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
    paddingBottom: DesignSystem.spacing[20],
  },
  section: {
    marginBottom: DesignSystem.spacing[8],
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
  },
  description: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
  benefitCard: {
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    marginBottom: DesignSystem.spacing[3],
    ...DesignSystem.shadows.sm,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[2],
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: DesignSystem.spacing[3],
  },
  benefitTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
  },
  benefitText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.relaxed,
  },
  infoCard: {
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    ...DesignSystem.shadows.sm,
  },
  highlightCard: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderWidth: 2,
    borderColor: DesignSystem.colors.primary[200],
  },
  infoText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.neutral[400],
    marginTop: DesignSystem.spacing[4],
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: DesignSystem.spacing[3],
  },
  disclaimerText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  footer: {
    padding: DesignSystem.spacing[6],
    backgroundColor: DesignSystem.colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.neutral[200],
  },
  closeButton: {
    borderRadius: DesignSystem.radius.xl,
    overflow: 'hidden',
    ...DesignSystem.shadows.lg,
  },
  closeButtonGradient: {
    paddingVertical: DesignSystem.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[0],
  },
});

