import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ReadyCard } from '@/components/ReadyCard';
import { BioAgeCard } from '@/components/BioAgeCard';
import { ImpactCard } from '@/components/ImpactCard';
import { DataSummary, SummaryItem } from '@/components/DataSummary';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedTouchable } from '@/components/AnimatedTouchable';
import { SkeletonLoader, SkeletonScoreCard } from '@/components/SkeletonLoader';
import { EmptyStateIllustration } from '@/components/EmptyStateIllustration';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import { AuroraBackground } from '@/components/AuroraBackground';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userAge, setUserAge] = useState(30);
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male');
  const [activeProtocols, setActiveProtocols] = useState(0);

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
      setTests((testsData as HormoneTest[]) || []);

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getInsightsSummary = (): SummaryItem[] => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const testsThisWeek = tests.filter(t => new Date(t.timestamp) >= oneWeekAgo).length;

    const uniqueHormones = new Set(tests.map(t => t.hormone_type)).size;

    return [
      {
        label: 'Tests This Week',
        value: testsThisWeek,
        icon: '📊',
        trend: testsThisWeek >= 3 ? 'up' : testsThisWeek > 0 ? 'neutral' : 'down',
        subtitle: testsThisWeek >= 3 ? 'On track!' : 'Keep going',
      },
      {
        label: 'Hormones Tracked',
        value: uniqueHormones,
        icon: '🧪',
        subtitle: 'of 3 total',
      },
      {
        label: 'Active Protocols',
        value: activeProtocols,
        icon: '📋',
        subtitle: activeProtocols > 0 ? 'In progress' : 'Start one',
      },
    ];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <SkeletonScoreCard />
          <SkeletonScoreCard />
          <SkeletonScoreCard />
        </ScrollView>
      </View>
    );
  }

  if (tests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <EmptyStateIllustration
            type="no_insights"
            title="No Insights Yet"
            description="Start logging tests to unlock powerful insights about your hormonal health"
            actionLabel="Log Your First Test"
            onActionPress={() => router.push('/test/input')}
            secondaryActionLabel="Learn More"
            onSecondaryActionPress={() => router.push('/help')}
          />
        </ScrollView>
      </View>
    );
  }

  const insightsSummary = getInsightsSummary();

  return (
    <AuroraBackground showRadialGradient={true}>
      <View style={styles.container}>
        {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/help');
          }}
        >
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Week</Text>
          <DataSummary items={insightsSummary} columns={3} />
        </View>

        {/* Core Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Metrics</Text>
          <Text style={styles.sectionSubtitle}>
            Track your key wellness indicators
          </Text>

          <AnimatedCard index={0} style={styles.cardWrapper}>
            <ReadyCard tests={tests} userGender={userGender} />
          </AnimatedCard>

          <AnimatedCard index={1} style={styles.cardWrapper}>
            <BioAgeCard
              tests={tests}
              chronologicalAge={userAge}
              userGender={userGender}
            />
          </AnimatedCard>

          <AnimatedCard index={2} style={styles.cardWrapper}>
            <ImpactCard tests={tests} userGender={userGender} />
          </AnimatedCard>
        </View>

        {/* Active Protocols */}
        {activeProtocols > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Protocols</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/protocols');
                }}
              >
                <Text style={styles.seeAllText}>See All →</Text>
              </TouchableOpacity>
            </View>
            <AnimatedCard index={3} style={styles.protocolsCard}>
              <AnimatedTouchable
                style={styles.protocolsButton}
                onPress={() => router.push('/(tabs)/protocols')}
              >
                <View style={styles.protocolsIcon}>
                  <Text style={styles.protocolsIconText}>📋</Text>
                </View>
                <View style={styles.protocolsInfo}>
                  <Text style={styles.protocolsCount}>{activeProtocols} Active</Text>
                  <Text style={styles.protocolsDescription}>
                    Tap to view your optimization protocols
                  </Text>
                </View>
                <Text style={styles.protocolsArrow}>→</Text>
              </AnimatedTouchable>
            </AnimatedCard>
          </View>
        )}

        {/* Patterns & Trends (Coming Soon) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patterns & Trends</Text>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonIcon}>📈</Text>
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            <Text style={styles.comingSoonDescription}>
              AI-powered pattern detection and personalized trend analysis
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <AnimatedTouchable
              style={styles.actionButton}
              onPress={() => router.push('/test/input')}
            >
              <Text style={styles.actionIcon}>🧪</Text>
              <Text style={styles.actionText}>Log Test</Text>
            </AnimatedTouchable>

            <AnimatedTouchable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/track')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View History</Text>
            </AnimatedTouchable>

            <AnimatedTouchable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/protocols')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Protocols</Text>
            </AnimatedTouchable>

            <AnimatedTouchable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/ask')}
            >
              <Text style={styles.actionIcon}>🤖</Text>
              <Text style={styles.actionText}>Ask AI</Text>
            </AnimatedTouchable>
          </View>
        </View>

        <View style={{ height: DesignSystem.spacing[20] }} />
      </ScrollView>
    </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor removed for Aurora
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
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  helpButton: {
    width: DesignSystem.touchTarget.comfortable,
    height: DesignSystem.touchTarget.comfortable,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    fontSize: DesignSystem.iconSize.md,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[600],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
  },
  section: {
    marginBottom: DesignSystem.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  sectionSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[4],
  },
  seeAllText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[500],
  },
  cardWrapper: {
    marginBottom: DesignSystem.spacing[4],
  },
  protocolsCard: {
    marginBottom: DesignSystem.spacing[4],
  },
  protocolsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  protocolsIcon: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing[4],
  },
  protocolsIconText: {
    fontSize: DesignSystem.iconSize.xl,
  },
  protocolsInfo: {
    flex: 1,
  },
  protocolsCount: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  protocolsDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
  },
  protocolsArrow: {
    fontSize: DesignSystem.iconSize.lg,
    color: DesignSystem.colors.neutral[400],
  },
  comingSoonCard: {
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    borderStyle: 'dashed',
  },
  comingSoonIcon: {
    fontSize: DesignSystem.iconSize['3xl'],
    marginBottom: DesignSystem.spacing[3],
  },
  comingSoonTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  comingSoonDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing[3],
  },
  actionButton: {
    width: (width - DesignSystem.spacing[6] * 2 - DesignSystem.spacing[3]) / 2,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  actionIcon: {
    fontSize: DesignSystem.iconSize.xl,
    marginBottom: DesignSystem.spacing[2],
  },
  actionText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[700],
  },
});

