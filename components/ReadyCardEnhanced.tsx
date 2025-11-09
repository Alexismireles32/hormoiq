import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { calculateReadyScore, getReadyColor, getReadyEmoji, getReadyMessage } from '@/lib/ready';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DesignSystem } from '@/constants/DesignSystem';
import { CircularProgress } from './ProgressBar';
import { router } from 'expo-router';
import { AccuracyBadge, calculateAccuracyLevel, getAccuracyRequirements } from './AccuracyBadge';

interface ReadyCardEnhancedProps {
  tests: HormoneTest[];
  userGender: 'male' | 'female' | 'other';
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ReadyCardEnhanced({ tests, userGender }: ReadyCardEnhancedProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const readyData = calculateReadyScore(tests, userGender);
  
  // Calculate accuracy level
  const uniqueDays = new Set(tests.map(t => new Date(t.timestamp).toDateString())).size;
  const requirements = getAccuracyRequirements('readyscore');
  const accuracyLevel = calculateAccuracyLevel(tests.length, uniqueDays, requirements);

  useEffect(() => {
    setMounted(true);

    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!mounted || !readyData.can_calculate) return;

    // Animate score counting up
    Animated.timing(scoreAnim, {
      toValue: readyData.score,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Animate progress ring
    Animated.timing(progressAnim, {
      toValue: readyData.score / 100,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [mounted, readyData.score, readyData.can_calculate]);

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

  // Locked state
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

  // Interpolate animated score for display
  const animatedScoreValue = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          onPress={handleViewBreakdown}
          activeOpacity={0.7}
        >
          {/* Animated Background Glow */}
          <Animated.View
            style={[
              styles.backgroundGlow,
              {
                opacity: glowAnim,
                backgroundColor: `${color}20`,
              },
            ]}
          />

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

          {/* Animated Progress Ring */}
          <View style={styles.ringContainer}>
            <AnimatedProgressRing
              progress={progressAnim}
              score={readyData.score}
              color={color}
              size={220}
              strokeWidth={18}
              pulseScale={pulseAnim}
            />
            <Animated.View 
              style={[
                styles.scoreOverlay,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Animated.Text style={styles.scoreNumber}>
                {animatedScoreValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0', '100'],
                }).interpolate((value) => Math.round(parseFloat(value as any)).toString())}
              </Animated.Text>
              <Text style={styles.scoreEmoji}>{emoji}</Text>
            </Animated.View>
          </View>

          <Text style={styles.message}>{message}</Text>
          <View style={[styles.levelBadge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.levelLabel, { color }]}>
              {readyData.level === 'exceptional' ? 'EXCEPTIONAL' :
               readyData.level === 'good' ? 'GOOD' :
               readyData.level === 'moderate' ? 'MODERATE' :
               readyData.level === 'low' ? 'LOW' : 'VERY LOW'}
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
      </Animated.View>

      {/* Breakdown Modal (keep existing) */}
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
                { label: 'Cortisol 💧', data: readyData.factors.cortisol, weight: '30%' },
                { label: 'Testosterone ⚡', data: readyData.factors.testosterone, weight: '25%' },
                { label: 'DHEA 🔥', data: readyData.factors.dhea, weight: '15%' },
                { label: 'Trend 📈', data: readyData.factors.trend, weight: '15%' },
                { label: 'Consistency 🎯', data: readyData.factors.consistency, weight: '15%' },
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
                    <Text style={styles.factorStatus}>Direction: {item.data.direction}</Text>
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
 * Animated Progress Ring Component with Gradient and Glow
 */
function AnimatedProgressRing({ 
  progress, 
  score,
  color, 
  size = 220, 
  strokeWidth = 18,
  pulseScale,
}: { 
  progress: Animated.Value;
  score: number;
  color: string; 
  size?: number; 
  strokeWidth?: number;
  pulseScale: Animated.Value;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Get gradient colors based on score
  const getGradientColors = (score: number): [string, string, string] => {
    const percentage = score;
    
    if (percentage >= 75) {
      return ['#10b981', '#059669', '#047857']; // Green gradient
    } else if (percentage >= 50) {
      return ['#fbbf24', '#f59e0b', '#d97706']; // Yellow/amber gradient
    } else {
      return ['#f87171', '#ef4444', '#dc2626']; // Red gradient
    }
  };

  const [color1, color2, color3] = getGradientColors(score);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <SvgLinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color1} stopOpacity="1" />
          <Stop offset="50%" stopColor={color2} stopOpacity="1" />
          <Stop offset="100%" stopColor={color3} stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>

      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={DesignSystem.colors.neutral[200]}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.3}
      />

      {/* Inner pulse circle */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius - 15}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={0.2}
      />

      {/* Progress circle with gradient */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#scoreGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius['2xl'],
    backgroundColor: DesignSystem.colors.surface,
    marginBottom: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
    ...DesignSystem.shadows.md,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    borderRadius: 125,
    transform: [{ translateX: -125 }, { translateY: -125 }],
    zIndex: -1,
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
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing[2],
    color: DesignSystem.colors.neutral[900],
  },
  lockedSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.sm * 1.5,
  },
  lockedProgress: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[600],
    marginBottom: DesignSystem.spacing[2],
    marginTop: DesignSystem.spacing[4],
  },
  previewSection: {
    width: '100%',
    backgroundColor: DesignSystem.colors.neutral[50],
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
    fontSize: 16,
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
    minHeight: 48,
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
  labelWithBadge: {
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  label: {
    fontSize: 13,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.light,
    letterSpacing: 0.5,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[6],
    position: 'relative',
    height: 240,
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 80,
    fontWeight: '200',
    color: DesignSystem.colors.neutral[900],
    letterSpacing: -2,
  },
  scoreEmoji: {
    fontSize: 36,
    marginTop: DesignSystem.spacing[2],
  },
  message: {
    fontSize: DesignSystem.typography.fontSize.base,
    textAlign: 'center',
    color: DesignSystem.colors.neutral[800],
    marginBottom: DesignSystem.spacing[4],
    fontWeight: DesignSystem.typography.fontWeight.light,
    lineHeight: DesignSystem.typography.fontSize.base * 1.5,
  },
  levelBadge: {
    alignSelf: 'center',
    paddingVertical: DesignSystem.spacing[2],
    paddingHorizontal: DesignSystem.spacing[5],
    borderRadius: DesignSystem.radius.full,
    marginBottom: DesignSystem.spacing[6],
  },
  levelLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    letterSpacing: 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  actionButton: {
    flex: 1,
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.xl,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
  },
  actionButtonText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[800],
  },
  // Modal styles (keep existing)
  modal: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[16],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[200],
  },
  modalTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  closeButton: {
    padding: DesignSystem.spacing[2],
  },
  closeButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.primary[500],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  modalContent: {
    flex: 1,
    padding: DesignSystem.spacing[6],
  },
  modalSection: {
    marginBottom: DesignSystem.spacing[8],
  },
  modalSectionTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing[4],
    color: DesignSystem.colors.neutral[900],
  },
  summaryCard: {
    padding: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.xl,
    backgroundColor: DesignSystem.colors.neutral[50],
    borderLeftWidth: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[3],
    gap: DesignSystem.spacing[4],
  },
  summaryScore: {
    fontSize: 48,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  summaryEmoji: {
    fontSize: 40,
  },
  summaryMessage: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
  },
  factorItem: {
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.neutral[50],
    marginBottom: DesignSystem.spacing[3],
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[2],
  },
  factorLabel: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  factorWeight: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  factorBar: {
    height: 8,
    backgroundColor: DesignSystem.colors.neutral[200],
    borderRadius: DesignSystem.radius.sm,
    marginBottom: DesignSystem.spacing[2],
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    borderRadius: DesignSystem.radius.sm,
  },
  factorScore: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  factorStatus: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
  },
  protocolItem: {
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.neutral[50],
    marginBottom: DesignSystem.spacing[3],
  },
  protocolText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[800],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
});

