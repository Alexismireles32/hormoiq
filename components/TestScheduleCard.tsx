/**
 * TestScheduleCard Component
 * 
 * Displays the user's 12-test kit progress and next scheduled test
 * - Shows next test date and hormone
 * - Progress ring: X/12 tests complete
 * - Kit completion countdown
 * - Quick action to log test
 * - Shows missed tests if any
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import { CircularProgress } from './CircularProgress';
import { getNextTest, getScheduleAdherence, detectSkippedTests } from '@/lib/scheduleGenerator';
import { TestScheduleEvent } from '@/types';

interface TestScheduleCardProps {
  userId: string;
}

export function TestScheduleCard({ userId }: TestScheduleCardProps) {
  const [loading, setLoading] = useState(true);
  const [nextTest, setNextTest] = useState<TestScheduleEvent | null>(null);
  const [adherence, setAdherence] = useState({
    totalTests: 12,
    completedTests: 0,
    skippedTests: 0,
    upcomingTests: 0,
    adherenceRate: 100,
    daysRemaining: 28,
  });
  const [missedTests, setMissedTests] = useState<TestScheduleEvent[]>([]);

  useEffect(() => {
    loadScheduleData();
  }, [userId]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const [next, stats, missed] = await Promise.all([
        getNextTest(userId),
        getScheduleAdherence(userId),
        detectSkippedTests(userId),
      ]);

      setNextTest(next);
      setAdherence(stats);
      setMissedTests(missed);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to test input with hormone pre-selected if available
    if (nextTest) {
      router.push(`/test/input?hormone=${nextTest.hormone_type}`);
    } else {
      router.push('/test');
    }
  };

  const getHormoneIcon = (hormone: string): string => {
    switch (hormone) {
      case 'cortisol':
        return '⚡';
      case 'testosterone':
        return '💪';
      case 'dhea':
        return '🔋';
      case 'progesterone':
        return '🌙';
      default:
        return '🧪';
    }
  };

  const getHormoneName = (hormone: string): string => {
    return hormone.charAt(0).toUpperCase() + hormone.slice(1);
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const completionPercentage = adherence.totalTests > 0
    ? (adherence.completedTests / adherence.totalTests) * 100
    : 0;

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary[600]} />
      </View>
    );
  }

  // No schedule set up yet
  if (adherence.totalTests === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.noScheduleContainer}>
          <Text style={styles.noScheduleIcon}>📦</Text>
          <Text style={styles.noScheduleTitle}>No Test Kit Schedule</Text>
          <Text style={styles.noScheduleText}>
            Set up your testing schedule once you receive your kit!
          </Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.setupButtonText}>Set Up Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Kit completed!
  if (adherence.completedTests === adherence.totalTests && nextTest === null) {
    return (
      <View style={[styles.card, styles.completedCard]}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedTitle}>Kit Complete!</Text>
          <Text style={styles.completedText}>
            You've completed all {adherence.totalTests} tests. Great job!
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{adherence.adherenceRate}%</Text>
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{adherence.completedTests}</Text>
              <Text style={styles.statLabel}>Tests Done</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Schedule</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {adherence.completedTests}/{adherence.totalTests}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Progress Ring */}
        <View style={styles.leftSection}>
          <CircularProgress
            size={100}
            progress={completionPercentage}
            strokeWidth={8}
            color={DesignSystem.colors.primary[600]}
            backgroundColor={DesignSystem.colors.neutral[200]}
          />
          <Text style={styles.progressLabel}>Complete</Text>
        </View>

        {/* Next Test Info */}
        <View style={styles.rightSection}>
          {nextTest ? (
            <>
              <Text style={styles.nextLabel}>Next Test</Text>
              <View style={styles.nextTestInfo}>
                <Text style={styles.hormoneIcon}>
                  {getHormoneIcon(nextTest.hormone_type)}
                </Text>
                <Text style={styles.hormoneName}>
                  {getHormoneName(nextTest.hormone_type)}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {formatDate(nextTest.scheduled_date)}
              </Text>
              <Text style={styles.dayText}>
                {getDayName(nextTest.day_of_week)}
              </Text>
            </>
          ) : (
            <View style={styles.noTestInfo}>
              <FontAwesome name="check-circle" size={32} color={DesignSystem.colors.success.DEFAULT} />
              <Text style={styles.noTestText}>All tests completed!</Text>
            </View>
          )}
        </View>
      </View>

      {/* Missed Tests Warning */}
      {missedTests.length > 0 && (
        <View style={styles.warningContainer}>
          <FontAwesome name="exclamation-triangle" size={16} color={DesignSystem.colors.warning.DEFAULT} />
          <Text style={styles.warningText}>
            {missedTests.length} test{missedTests.length > 1 ? 's' : ''} behind schedule
          </Text>
        </View>
      )}

      {/* Action Button */}
      {nextTest && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogTest}
          activeOpacity={0.7}
        >
          <FontAwesome name="plus-circle" size={20} color={DesignSystem.colors.neutral[0]} />
          <Text style={styles.actionButtonText}>Log Test Now</Text>
        </TouchableOpacity>
      )}

      {/* Stats Footer */}
      <View style={styles.footer}>
        <View style={styles.footerStat}>
          <FontAwesome name="calendar-check-o" size={14} color={DesignSystem.colors.neutral[600]} />
          <Text style={styles.footerText}>{adherence.upcomingTests} upcoming</Text>
        </View>
        <View style={styles.footerStat}>
          <FontAwesome name="clock-o" size={14} color={DesignSystem.colors.neutral[600]} />
          <Text style={styles.footerText}>{adherence.daysRemaining} days left</Text>
        </View>
        {adherence.adherenceRate < 80 && (
          <View style={styles.footerStat}>
            <FontAwesome name="line-chart" size={14} color={DesignSystem.colors.warning.DEFAULT} />
            <Text style={[styles.footerText, { color: DesignSystem.colors.warning.DEFAULT }]}>
              {adherence.adherenceRate}% adherence
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    padding: DesignSystem.spacing[5],
    ...DesignSystem.shadows.sm,
  },
  completedCard: {
    backgroundColor: DesignSystem.colors.success.light,
    borderColor: DesignSystem.colors.success.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold as any,
    color: DesignSystem.colors.neutral[900],
  },
  progressBadge: {
    backgroundColor: DesignSystem.colors.primary[100],
    paddingHorizontal: DesignSystem.spacing[3],
    paddingVertical: DesignSystem.spacing[1],
    borderRadius: DesignSystem.radius.full,
  },
  progressText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
    color: DesignSystem.colors.primary[700],
  },
  content: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[5],
    marginBottom: DesignSystem.spacing[4],
  },
  leftSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
    marginTop: DesignSystem.spacing[2],
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nextLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: DesignSystem.spacing[1],
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
  nextTestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
    marginBottom: DesignSystem.spacing[1],
  },
  hormoneIcon: {
    fontSize: 28,
  },
  hormoneName: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold as any,
    color: DesignSystem.colors.neutral[900],
  },
  dateText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.primary[600],
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
  },
  dayText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
  },
  noTestInfo: {
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  noTestText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[700],
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
    backgroundColor: DesignSystem.colors.warning.light,
    padding: DesignSystem.spacing[3],
    borderRadius: DesignSystem.radius.md,
    marginBottom: DesignSystem.spacing[3],
  },
  warningText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.warning.dark,
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing[2],
    backgroundColor: DesignSystem.colors.primary[600],
    paddingVertical: DesignSystem.spacing[3],
    borderRadius: DesignSystem.radius.lg,
    marginBottom: DesignSystem.spacing[3],
  },
  actionButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
    color: DesignSystem.colors.neutral[0],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignSystem.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.neutral[200],
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[1],
  },
  footerText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
  },
  // No schedule state
  noScheduleContainer: {
    alignItems: 'center',
    padding: DesignSystem.spacing[6],
  },
  noScheduleIcon: {
    fontSize: 64,
    marginBottom: DesignSystem.spacing[4],
  },
  noScheduleTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold as any,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  noScheduleText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  setupButton: {
    backgroundColor: DesignSystem.colors.primary[600],
    paddingHorizontal: DesignSystem.spacing[6],
    paddingVertical: DesignSystem.spacing[3],
    borderRadius: DesignSystem.radius.lg,
  },
  setupButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
    color: DesignSystem.colors.neutral[0],
  },
  // Completed state
  completedContainer: {
    alignItems: 'center',
    padding: DesignSystem.spacing[4],
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: DesignSystem.spacing[3],
  },
  completedTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold as any,
    color: DesignSystem.colors.success.dark,
    marginBottom: DesignSystem.spacing[2],
  },
  completedText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[700],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold as any,
    color: DesignSystem.colors.success.dark,
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: DesignSystem.colors.neutral[300],
  },
});

