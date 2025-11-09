import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

// New Components
import { InsightsDashboardGrid } from '@/components/InsightsDashboardGrid';
import { AnimatedStatCard } from '@/components/AnimatedStatCard';
import { InteractiveHormoneChart } from '@/components/InteractiveHormoneChart';
import { FlippableReadyCard } from '@/components/FlippableReadyCard';
import { FlippableBioAgeCard } from '@/components/FlippableBioAgeCard';
import { FlippableImpactCard } from '@/components/FlippableImpactCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { EliAnimatedBackground } from '@/components/EliAnimatedBackground';
import { CelebrationEffect } from '@/components/CelebrationEffect';
import { SkeletonScoreCard } from '@/components/SkeletonLoader';
import { EmptyStateIllustration } from '@/components/EmptyStateIllustration';

export default function InsightsScreen() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAge, setUserAge] = useState(30);
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male');
  const [activeProtocols, setActiveProtocols] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'confetti' | 'sparkle' | 'glow' | 'badge'>('confetti');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load tests
      const { data: testsData, error: testsError } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (testsError) throw testsError;
      const fetchedTests = (testsData as HormoneTest[]) || [];
      setTests(fetchedTests);

      // Check for celebration triggers
      checkCelebrations(fetchedTests);

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('age, gender')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setUserAge(profileData.age || 30);
        setUserGender(profileData.gender || 'male');
      }

      // Load active protocols count
      const { data: protocolsData, error: protocolsError } = await supabase
        .from('user_protocols')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!protocolsError && protocolsData) {
        setActiveProtocols(protocolsData.length);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCelebrations = (tests: HormoneTest[]) => {
    // Check for achievements
    if (tests.length === 1) {
      // First test logged
      triggerCelebration('sparkle');
    } else if (tests.length === 12) {
      // All 12 tests completed
      triggerCelebration('confetti');
    }
    
    // Check 7-day streak
    const last7Days = tests.filter((test) => {
      const testDate = new Date(test.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return testDate >= weekAgo;
    });
    
    if (last7Days.length >= 7) {
      triggerCelebration('badge');
    }
  };

  const triggerCelebration = (type: 'confetti' | 'sparkle' | 'glow' | 'badge') => {
    setCelebrationType(type);
    setShowCelebration(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Auto-hide after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const getStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const testsThisWeek = tests.filter((t) => new Date(t.timestamp) >= oneWeekAgo).length;

    // Calculate streak
    const sortedTests = [...tests].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    let streak = 0;
    let currentDate = new Date();
    for (const test of sortedTests) {
      const testDate = new Date(test.timestamp);
      const daysDiff = Math.floor(
        (currentDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate completion rate
    const totalExpected = 12;
    const completionRate = Math.round((tests.length / totalExpected) * 100);

    // Unique hormones tracked
    const uniqueHormones = new Set(tests.map((t) => t.hormone_type)).size;

    // Days active
    const firstTestDate = sortedTests.length > 0 ? new Date(sortedTests[sortedTests.length - 1].timestamp) : new Date();
    const daysActive = Math.floor((now.getTime() - firstTestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      testsThisWeek,
      totalTests: tests.length,
      streak,
      completionRate,
      uniqueHormones,
      activeProtocols,
      daysActive,
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <View style={styles.loadingContainer}>
          <SkeletonScoreCard />
          <SkeletonScoreCard />
          <SkeletonScoreCard />
        </View>
      </View>
    );
  }

  if (tests.length === 0) {
    return (
      <EliAnimatedBackground type="purple" scrollEnabled={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSubtitle}>Your wellness dashboard</Text>
        </View>
        <View style={styles.emptyContainer}>
          <EmptyStateIllustration
            type="no_insights"
            title="No Insights Yet"
            description="Start logging tests to unlock powerful insights about your hormonal health"
            actionLabel="Log Your First Test"
            onActionPress={() => router.push('/test/input')}
            secondaryActionLabel="Learn More"
            onSecondaryActionPress={() => router.push('/help')}
          />
        </View>
      </EliAnimatedBackground>
    );
  }

  const stats = getStats();

  // Build grid items
  const gridItems = [
    // Stat cards (2 columns)
    {
      id: 'stat-tests',
      component: (
        <AnimatedStatCard
          type="tests"
          value={stats.totalTests}
          label="Total Tests"
          icon="🧪"
          trend={stats.testsThisWeek >= 3 ? 'up' : 'neutral'}
          trendValue={`${stats.testsThisWeek} this week`}
          gradient={DesignSystem.colors.gradients.blueBlur}
        />
      ),
      span: 1 as const,
    },
    {
      id: 'stat-streak',
      component: (
        <AnimatedStatCard
          type="streak"
          value={stats.streak}
          label="Day Streak"
          icon="🔥"
          trend={stats.streak >= 7 ? 'up' : stats.streak > 0 ? 'neutral' : 'down'}
          gradient={DesignSystem.colors.gradients.yellowBlur}
        />
      ),
      span: 1 as const,
    },
    // Interactive chart (full width)
    {
      id: 'chart',
      component: <InteractiveHormoneChart tests={tests} selectedHormone="cortisol" />,
      span: 2 as const,
    },
    // Flippable cards (2 columns each, taking up 1/2 width)
    {
      id: 'ready-card',
      component: <FlippableReadyCard tests={tests} userGender={userGender} />,
      span: 1 as const,
    },
    {
      id: 'bioage-card',
      component: (
        <FlippableBioAgeCard tests={tests} chronologicalAge={userAge} userGender={userGender} />
      ),
      span: 1 as const,
    },
    // More stat cards
    {
      id: 'stat-completion',
      component: (
        <AnimatedStatCard
          type="completion"
          value={stats.completionRate}
          label="Completion Rate"
          icon="🎯"
          trend={stats.completionRate >= 75 ? 'up' : 'neutral'}
          gradient={DesignSystem.colors.gradients.greenBlur}
        />
      ),
      span: 1 as const,
    },
    {
      id: 'stat-hormones',
      component: (
        <AnimatedStatCard
          type="hormones"
          value={stats.uniqueHormones}
          label="Hormones Tracked"
          icon="💧"
          gradient={DesignSystem.colors.gradients.blueBlur}
        />
      ),
      span: 1 as const,
    },
    // Impact card (full width)
    {
      id: 'impact-card',
      component: <FlippableImpactCard tests={tests} userGender={userGender} />,
      span: 2 as const,
    },
    // Final stat cards
    {
      id: 'stat-protocols',
      component: (
        <AnimatedStatCard
          type="protocols"
          value={stats.activeProtocols}
          label="Active Protocols"
          icon="📋"
          gradient={DesignSystem.colors.gradients.pinkBlur}
          onPress={() => router.push('/(tabs)/protocols')}
        />
      ),
      span: 1 as const,
    },
    {
      id: 'stat-days',
      component: (
        <AnimatedStatCard
          type="days"
          value={stats.daysActive}
          label="Days Active"
          icon="📅"
          gradient={DesignSystem.colors.gradients.purpleBlur}
        />
      ),
      span: 1 as const,
    },
  ];

  return (
    <EliAnimatedBackground type="purple">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSubtitle}>Your wellness dashboard</Text>
      </View>

      {/* Grid Dashboard */}
      <InsightsDashboardGrid
        items={gridItems}
        onRefresh={handleRefresh}
        columnGap={DesignSystem.spacing[4]}
        rowGap={DesignSystem.spacing[4]}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="+"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/test/input');
        }}
        position="bottom-right"
        gradient={DesignSystem.colors.gradients.primary}
      />

      {/* Celebration Effects */}
      {showCelebration && (
        <CelebrationEffect
          type={celebrationType}
          trigger={showCelebration}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </EliAnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  header: {
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[6],
    backgroundColor: DesignSystem.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[200],
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
  },
  headerGradient: {
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[6],
  },
  headerTitleWhite: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: DesignSystem.spacing[1],
  },
  headerSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainer: {
    padding: DesignSystem.spacing[6],
    gap: DesignSystem.spacing[4],
  },
  emptyContainer: {
    flex: 1,
    padding: DesignSystem.spacing[6],
    justifyContent: 'center',
  },
});
