import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { ProgressBar } from './ProgressBar';
import { HormoneTest } from '@/types';

interface ProgressTrackerProps {
  tests: HormoneTest[];
  userAge: number;
}

interface Feature {
  id: string;
  name: string;
  icon: string;
  requiredTests: number;
  requiredDays?: number;
  description: string;
  unlocked: boolean;
  progress: number;
}

export function ProgressTracker({ tests, userAge }: ProgressTrackerProps) {
  // Calculate test counts
  const totalTests = tests.length;
  const last7Days = tests.filter(test => {
    const testDate = new Date(test.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return testDate >= weekAgo;
  });
  const testsThisWeek = last7Days.length;

  // Calculate unique days tracked
  const uniqueDays = new Set(
    tests.map(test => new Date(test.timestamp).toDateString())
  ).size;

  // Calculate streak
  const calculateStreak = (): number => {
    if (tests.length === 0) return 0;
    
    const sortedTests = [...tests].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const hasTestOnDay = sortedTests.some(test => {
        const testDate = new Date(test.timestamp);
        testDate.setHours(0, 0, 0, 0);
        return testDate.getTime() === currentDate.getTime();
      });
      
      if (hasTestOnDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        // Check yesterday if no test today
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Define features and their unlock requirements
  const features: Feature[] = [
    {
      id: 'readyscore',
      name: 'READYSCORE™',
      icon: '⚡',
      requiredTests: 3,
      requiredDays: 7,
      description: 'Track your daily wellness number',
      unlocked: testsThisWeek >= 3,
      progress: (testsThisWeek / 3) * 100,
    },
    {
      id: 'bioage',
      name: 'BIOAGE™',
      icon: '🧬',
      requiredTests: 5,
      requiredDays: 7,
      description: 'Discover your biological age',
      unlocked: testsThisWeek >= 5,
      progress: (testsThisWeek / 5) * 100,
    },
    {
      id: 'impact',
      name: 'IMPACT™',
      icon: '🎯',
      requiredTests: 10,
      description: 'See what works for you',
      unlocked: totalTests >= 10,
      progress: (totalTests / 10) * 100,
    },
  ];

  // Calculate overall progress (based on features unlocked)
  const unlockedFeatures = features.filter(f => f.unlocked).length;
  const overallProgress = (unlockedFeatures / features.length) * 100;

  return (
    <View style={styles.container}>
      {/* Overall Progress */}
      <View style={styles.overallSection}>
        <View style={styles.overallHeader}>
          <Text style={styles.overallTitle}>Your Progress</Text>
          <Text style={styles.overallPercentage}>{Math.round(overallProgress)}%</Text>
        </View>
        <ProgressBar
          progress={overallProgress}
          height={12}
          color={DesignSystem.colors.primary[500]}
          showPercentage={false}
          style={{ marginBottom: DesignSystem.spacing[2] }}
        />
        <Text style={styles.overallDescription}>
          {unlockedFeatures} of {features.length} features unlocked
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🧪</Text>
          <Text style={styles.statValue}>{totalTests}</Text>
          <Text style={styles.statLabel}>Total Tests</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{uniqueDays}</Text>
          <Text style={styles.statLabel}>Days Tracked</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Feature Unlock Progress */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Feature Unlocks</Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuresList}
        >
          {features.map((feature) => (
            <View
              key={feature.id}
              style={[
                styles.featureCard,
                feature.unlocked && styles.featureCardUnlocked,
              ]}
            >
              <Text
                style={[
                  styles.featureIcon,
                  !feature.unlocked && styles.featureIconLocked,
                ]}
              >
                {feature.icon}
              </Text>
              
              <Text style={styles.featureName}>{feature.name}</Text>
              
              {feature.unlocked ? (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedText}>✓ Unlocked</Text>
                </View>
              ) : (
                <>
                  <ProgressBar
                    progress={feature.progress}
                    height={6}
                    color={DesignSystem.colors.primary[500]}
                    showPercentage={false}
                    style={{ marginVertical: DesignSystem.spacing[2] }}
                  />
                  <Text style={styles.featureRequirement}>
                    {feature.requiredTests - (feature.requiredDays ? testsThisWeek : totalTests)}{' '}
                    more test{feature.requiredTests - (feature.requiredDays ? testsThisWeek : totalTests) !== 1 ? 's' : ''} needed
                    {feature.requiredDays && ' this week'}
                  </Text>
                </>
              )}
              
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Motivational Message */}
      {overallProgress < 100 && (
        <View style={styles.motivationCard}>
          <Text style={styles.motivationIcon}>💪</Text>
          <Text style={styles.motivationText}>
            {overallProgress === 0
              ? 'Log your first test to start unlocking features!'
              : overallProgress < 33
              ? 'Great start! Keep testing to unlock more insights.'
              : overallProgress < 66
              ? 'You\'re making progress! More features await.'
              : 'Almost there! One more feature to unlock.'}
          </Text>
        </View>
      )}

      {overallProgress === 100 && (
        <View style={[styles.motivationCard, styles.completionCard]}>
          <Text style={styles.motivationIcon}>🎉</Text>
          <Text style={styles.completionText}>All Features Unlocked!</Text>
          <Text style={styles.motivationText}>
            You have full access to HormoIQ. Keep testing to maintain your insights.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: DesignSystem.spacing[6],
  },
  overallSection: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  overallTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[900],
  },
  overallPercentage: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: '200',
    color: DesignSystem.colors.primary[500],
  },
  overallDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  statIcon: {
    fontSize: DesignSystem.iconSize.lg,
    marginBottom: DesignSystem.spacing[2],
  },
  statValue: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: '200',
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
  },
  featuresSection: {
    gap: DesignSystem.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[900],
    paddingHorizontal: DesignSystem.spacing[1],
  },
  featuresList: {
    gap: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[1],
  },
  featureCard: {
    width: 180,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  featureCardUnlocked: {
    borderColor: DesignSystem.colors.success.DEFAULT,
    backgroundColor: DesignSystem.colors.success.light,
  },
  featureIcon: {
    fontSize: DesignSystem.iconSize.xl,
    marginBottom: DesignSystem.spacing[3],
  },
  featureIconLocked: {
    opacity: 0.4,
  },
  featureName: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  featureRequirement: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[500],
    marginBottom: DesignSystem.spacing[2],
  },
  featureDescription: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.xs * 1.5,
  },
  unlockedBadge: {
    backgroundColor: DesignSystem.colors.success.DEFAULT,
    paddingVertical: DesignSystem.spacing[1],
    paddingHorizontal: DesignSystem.spacing[2],
    borderRadius: DesignSystem.radius.full,
    alignSelf: 'flex-start',
    marginBottom: DesignSystem.spacing[2],
  },
  unlockedText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  motivationCard: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[3],
  },
  completionCard: {
    backgroundColor: DesignSystem.colors.success.light,
    borderColor: DesignSystem.colors.success.DEFAULT,
    flexDirection: 'column',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  motivationIcon: {
    fontSize: DesignSystem.iconSize.lg,
  },
  motivationText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.5,
  },
  completionText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.success.dark,
    textAlign: 'center',
  },
});

