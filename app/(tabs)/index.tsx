import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  View as RNView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ReadyCard } from '@/components/ReadyCard';
import { BioAgeCard } from '@/components/BioAgeCard';
import { SwipeableScoreCards } from '@/components/SwipeableScoreCards';
import { FeatureExplainer, FeatureType } from '@/components/FeatureExplainer';
import { SkeletonLoader, SkeletonCard, SkeletonScoreCard } from '@/components/SkeletonLoader';
import { EmptyStateIllustration } from '@/components/EmptyStateIllustration';
import { ProgressTracker } from '@/components/ProgressTracker';
import { GuidedTour, defaultTourSteps } from '@/components/GuidedTour';
import { FirstTestTutorial } from '@/components/FirstTestTutorial';
import { AnimatedTouchable } from '@/components/AnimatedTouchable';
import { AnimatedCard } from '@/components/AnimatedCard';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HORMONES = [
  { type: 'cortisol', name: 'Cortisol', icon: '💧', color: DesignSystem.colors.hormones.cortisol },
  { type: 'testosterone', name: 'Testosterone', icon: '⚡', color: DesignSystem.colors.hormones.testosterone },
  { type: 'dhea', name: 'DHEA', icon: '🔥', color: DesignSystem.colors.hormones.dhea },
] as const;

const FEATURES = [
  {
    id: 'impact',
    name: 'IMPACT™',
    description: 'See what works for you',
    icon: '🎯',
    backgroundColor: DesignSystem.colors.success.light,  // Soft green
    route: '/impact' as const,
    type: 'impact' as FeatureType,
  },
  {
    id: 'protocols',
    name: 'Protocols',
    description: 'Optimization plans',
    icon: '📋',
    backgroundColor: DesignSystem.colors.warning.light,  // Soft amber
    route: '/protocols' as const,
    type: 'protocols' as FeatureType,
  },
  {
    id: 'ask',
    name: 'ASK™',
    description: 'AI Hormone Coach',
    icon: '🤖',
    backgroundColor: DesignSystem.colors.primary[100],  // Soft purple
    route: '/ask' as const,
    type: 'ask' as FeatureType,
  },
];

// Helper function for greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male');
  const [userAge, setUserAge] = useState(30);
  const [showExplainer, setShowExplainer] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('test');
  const [showTour, setShowTour] = useState(false);
  const [showTestTutorial, setShowTestTutorial] = useState(false);

  useEffect(() => {
    loadData();
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const tourCompleted = await AsyncStorage.getItem('tour_completed');
      if (!tourCompleted && tests.length === 0) {
        // Show tour after a brief delay for better UX
        setTimeout(() => {
          setShowTour(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  };

  const handleTourComplete = async () => {
    try {
      await AsyncStorage.setItem('tour_completed', 'true');
      setShowTour(false);
      // Optionally show test tutorial after tour
      setTimeout(() => {
        setShowTestTutorial(true);
      }, 500);
    } catch (error) {
      console.error('Error saving tour completion:', error);
    }
  };

  const handleTutorialClose = async () => {
    try {
      await AsyncStorage.setItem('tutorial_seen', 'true');
      setShowTestTutorial(false);
    } catch (error) {
      console.error('Error saving tutorial seen:', error);
    }
  };

  const handleStartFirstTest = () => {
    setShowTestTutorial(false);
    router.push('/test');
  };

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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('gender, age')
        .eq('id', user.id)
        .single();
      if (userError) throw userError;
      if (userData) {
        setUserGender(userData.gender || 'male');
        setUserAge(userData.age || 30);
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

  const handleHormoneSelect = (hormoneType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/test/input',
      params: { hormone: hormoneType },
    });
  };

  const handleFeaturePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile');
  };

  const handleShowExplainer = (feature: FeatureType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentFeature(feature);
    setShowExplainer(true);
  };

  // Show skeleton loaders while loading
  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Skeleton */}
          <RNView style={styles.header}>
            <RNView>
              <SkeletonLoader width={120} height={16} style={{ marginBottom: 8 }} />
              <SkeletonLoader width={150} height={28} />
            </RNView>
            <SkeletonLoader
              width={48}
              height={48}
              borderRadius={DesignSystem.radius.full}
            />
          </RNView>

          {/* Score Card Skeletons */}
          <SkeletonScoreCard />
          
          {/* Quick Actions Skeleton */}
          <RNView style={styles.section}>
            <SkeletonLoader width={100} height={20} style={{ marginBottom: 16 }} />
            <RNView style={styles.quickActions}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader
                  key={i}
                  width={(width - DesignSystem.spacing[6] * 2 - DesignSystem.spacing[3] * 2) / 3}
                  height={100}
                  borderRadius={DesignSystem.radius.xl}
                />
              ))}
            </RNView>
          </RNView>

          {/* Feature Cards Skeleton */}
          <RNView style={styles.section}>
            <SkeletonLoader width={140} height={24} style={{ marginBottom: 16 }} />
            <RNView style={styles.featureGrid}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </RNView>
          </RNView>
        </ScrollView>
      </View>
    );
  }

  // Empty state - no tests logged yet
  if (tests.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <RNView style={styles.header}>
            <RNView>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.appName}>HormoIQ</Text>
            </RNView>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </RNView>

          {/* Welcome / Empty State */}
          <EmptyStateIllustration
            type="no_tests"
            title="Welcome to HormoIQ"
            description="Start your hormone tracking journey by logging your first test. It takes less than a minute!"
            actionLabel="Log Your First Test"
            onActionPress={() => router.push('/test')}
            secondaryActionLabel="How to Use Test Strips"
            onSecondaryActionPress={() => setShowTestTutorial(true)}
          />

          {/* Preview of Features - What You'll Unlock */}
          <RNView style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Unlock</Text>
            <Text style={styles.sectionSubtitle}>
              These powerful features activate as you log tests
            </Text>

            {/* Feature Preview Cards */}
            <RNView style={styles.featurePreviewGrid}>
              {/* ReadyScore */}
              <AnimatedCard delay={0} style={styles.featurePreviewCard}>
                <Text style={styles.featurePreviewIcon}>🎯</Text>
                <Text style={styles.featurePreviewName}>READYSCORE™</Text>
                <Text style={styles.featurePreviewDesc}>
                  Daily readiness score from your hormone levels
                </Text>
                <Text style={styles.featurePreviewUnlock}>
                  ✓ Unlocks with 1st test
                </Text>
              </AnimatedCard>

              {/* BioAge */}
              <AnimatedCard delay={100} style={styles.featurePreviewCard}>
                <Text style={styles.featurePreviewIcon}>🧬</Text>
                <Text style={styles.featurePreviewName}>BIOAGE™</Text>
                <Text style={styles.featurePreviewDesc}>
                  Your hormonal age vs. calendar age
                </Text>
                <Text style={styles.featurePreviewUnlock}>
                  Unlocks with 5 tests
                </Text>
              </AnimatedCard>

              {/* Impact */}
              <AnimatedCard delay={200} style={styles.featurePreviewCard}>
                <Text style={styles.featurePreviewIcon}>📈</Text>
                <Text style={styles.featurePreviewName}>IMPACT™</Text>
                <Text style={styles.featurePreviewDesc}>
                  See what interventions work for you
                </Text>
                <Text style={styles.featurePreviewUnlock}>
                  Unlocks with 10 tests
                </Text>
              </AnimatedCard>

              {/* ASK AI */}
              <AnimatedCard delay={300} style={styles.featurePreviewCard}>
                <Text style={styles.featurePreviewIcon}>🤖</Text>
                <Text style={styles.featurePreviewName}>ASK™ AI</Text>
                <Text style={styles.featurePreviewDesc}>
                  Personal hormone coach powered by GPT-4
                </Text>
                <Text style={styles.featurePreviewUnlock}>
                  ✓ Available now
                </Text>
              </AnimatedCard>

              {/* Protocols */}
              <AnimatedCard delay={400} style={styles.featurePreviewCard}>
                <Text style={styles.featurePreviewIcon}>📋</Text>
                <Text style={styles.featurePreviewName}>Protocols</Text>
                <Text style={styles.featurePreviewDesc}>
                  Evidence-based optimization plans
                </Text>
                <Text style={styles.featurePreviewUnlock}>
                  ✓ Available now
                </Text>
              </AnimatedCard>

              {/* Track */}
              <AnimatedCard delay={500} style={styles.featurePreviewCard}>
                <Text style={styles.featurePreviewIcon}>📊</Text>
                <Text style={styles.featurePreviewName}>Track</Text>
                <Text style={styles.featurePreviewDesc}>
                  View all your test history & trends
                </Text>
                <Text style={styles.featurePreviewUnlock}>
                  ✓ Available now
                </Text>
              </AnimatedCard>
            </RNView>
          </RNView>
        </ScrollView>

        {/* Feature Explainer Modal */}
        <FeatureExplainer
          visible={showExplainer}
          feature={currentFeature}
          onClose={() => setShowExplainer(false)}
        />

        {/* Guided Tour */}
        {showTour && (
          <GuidedTour
            steps={defaultTourSteps}
            onComplete={handleTourComplete}
            onSkip={handleTourComplete}
          />
        )}

        {/* First Test Tutorial */}
        {showTestTutorial && (
          <FirstTestTutorial onClose={() => setShowTestTutorial(false)} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <RNView style={styles.header}>
          <RNView>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.appName}>HormoIQ</Text>
          </RNView>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </RNView>

        {/* Swipeable Score Cards - Oura Style */}
        <SwipeableScoreCards>
          {/* READYSCORE™ Card */}
          <RNView>
            <RNView style={styles.sectionHeader}>
              <Text style={styles.featureName}>READYSCORE™</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleShowExplainer('readyscore')}
              >
                <Text style={styles.infoIcon}>ℹ️</Text>
              </TouchableOpacity>
            </RNView>
            <ReadyCard tests={tests} userGender={userGender} />
          </RNView>

          {/* BIOAGE™ Card */}
          <RNView>
            <RNView style={styles.sectionHeader}>
              <Text style={styles.featureName}>BIOAGE™</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleShowExplainer('bioage')}
              >
                <Text style={styles.infoIcon}>ℹ️</Text>
              </TouchableOpacity>
            </RNView>
            <BioAgeCard
              tests={tests}
              chronologicalAge={userAge}
              userGender={userGender}
            />
          </RNView>

          {/* IMPACT™ Card - Summary */}
          <RNView>
            <RNView style={styles.sectionHeader}>
              <Text style={styles.featureName}>IMPACT™</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleShowExplainer('impact')}
              >
                <Text style={styles.infoIcon}>ℹ️</Text>
              </TouchableOpacity>
            </RNView>
            <TouchableOpacity
              style={styles.impactCard}
              onPress={() => handleFeaturePress('/impact')}
              activeOpacity={0.7}
            >
              <Text style={styles.impactIcon}>🎯</Text>
              <Text style={styles.impactTitle}>What Works For You</Text>
              <Text style={styles.impactDescription}>
                Track interventions and see what actually moves the needle on your hormones
              </Text>
              <RNView style={styles.impactCTA}>
                <Text style={styles.impactCTAText}>View Insights</Text>
                <Text style={styles.impactArrow}>→</Text>
              </RNView>
            </TouchableOpacity>
          </RNView>
        </SwipeableScoreCards>

        {/* Progress Tracker - Gamification */}
        <RNView style={styles.section}>
          <ProgressTracker tests={tests} userAge={userAge} />
        </RNView>

        {/* Quick TEST™ Actions - Prominent CTA */}
        <RNView style={styles.section}>
          <RNView style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Log Your Test</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => handleShowExplainer('test')}
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
            </TouchableOpacity>
          </RNView>
          
          {/* Last Test Time */}
          {tests.length > 0 && (
            <Text style={styles.lastTestInfo}>
              Last test:{' '}
              {(() => {
                const lastTest = new Date(tests[0].timestamp);
                const now = new Date();
                const diffMs = now.getTime() - lastTest.getTime();
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor(diffMs / (1000 * 60));
                
                if (diffHrs < 1) {
                  return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                } else if (diffHrs < 24) {
                  return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
                } else {
                  const diffDays = Math.floor(diffHrs / 24);
                  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                }
              })()}
            </Text>
          )}
          
          <Text style={styles.sectionSubtitle}>Choose a hormone to log</Text>
          <RNView style={styles.quickActions}>
            {HORMONES.map((hormone, index) => (
              <AnimatedCard key={hormone.type} index={index} style={{ flex: 1 }}>
                <AnimatedTouchable
                  style={styles.quickActionButton}
                  onPress={() => handleHormoneSelect(hormone.type)}
                  hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
                >
                  <RNView style={[styles.hormoneDot, { backgroundColor: hormone.color }]} />
                  <Text style={styles.quickActionIcon}>{hormone.icon}</Text>
                  <Text style={styles.quickActionText}>{hormone.name}</Text>
                </AnimatedTouchable>
              </AnimatedCard>
            ))}
          </RNView>
        </RNView>

        {/* Feature Grid - Oura Style with Pastel Backgrounds */}
        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          <RNView style={styles.featureGrid}>
            {FEATURES.map((feature, index) => (
              <AnimatedCard key={feature.id} index={index + 3} style={{ flex: 1 }}>
                <AnimatedTouchable
                  style={styles.featureCard}
                  onPress={() => handleFeaturePress(feature.route)}
                  scaleValue={0.98}
                >
                  <RNView style={styles.featureCardHeader}>
                    <RNView style={[styles.iconCircle, { backgroundColor: feature.backgroundColor }]}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                    </RNView>
                    <TouchableOpacity
                      style={styles.featureInfoButton}
                      onPress={() => handleShowExplainer(feature.type)}
                    >
                      <Text style={styles.featureInfoIcon}>ℹ️</Text>
                    </TouchableOpacity>
                  </RNView>
                  <Text style={styles.featureCardName}>{feature.name}</Text>
                  <Text style={styles.featureCardDescription}>{feature.description}</Text>
                </AnimatedTouchable>
              </AnimatedCard>
            ))}
          </RNView>
        </RNView>

        {/* Quick Stats */}
        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <RNView style={styles.statsGrid}>
            <RNView style={styles.statCard}>
              <Text style={styles.statValue}>{tests.length}</Text>
              <Text style={styles.statLabel}>Total Tests</Text>
            </RNView>
            <RNView style={styles.statCard}>
              <Text style={styles.statValue}>
                {tests.filter(t => {
                  const testDate = new Date(t.timestamp);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return testDate >= weekAgo;
                }).length}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </RNView>
            <RNView style={styles.statCard}>
              <Text style={styles.statValue}>
                {new Set(tests.map(t => new Date(t.timestamp).toDateString())).size}
              </Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </RNView>
          </RNView>
        </RNView>

        {/* Tip Section */}
        <RNView style={styles.tipSection}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipTitle}>Optimization Tip</Text>
          <Text style={styles.tipText}>
            Test your hormones at the same time each day for the most consistent tracking and better insights from READYSCORE™.
          </Text>
        </RNView>

        <RNView style={{ height: DesignSystem.spacing[20] }} />
      </ScrollView>

      {/* Floating TEST™ Button - Oura Style (Solid Color) */}
      <AnimatedTouchable
        style={styles.fab}
        onPress={() => router.push('/test')}
        hapticStyle={Haptics.ImpactFeedbackStyle.Heavy}
        scaleValue={0.94}
      >
        <Text style={styles.fabIcon}>🧪</Text>
        <Text style={styles.fabText}>TEST™</Text>
      </AnimatedTouchable>

      {/* Feature Explainer Modal */}
      <FeatureExplainer
        visible={showExplainer}
        feature={currentFeature}
        onClose={() => setShowExplainer(false)}
      />

      {/* Guided Tour - shown after first login */}
      <GuidedTour
        visible={showTour}
        onComplete={handleTourComplete}
        steps={defaultTourSteps}
      />

      {/* First Test Tutorial - shown after tour or manually */}
      <FirstTestTutorial
        visible={showTestTutorial}
        onClose={handleTutorialClose}
        onStartTest={handleStartFirstTest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],  // Off-white cream
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[8],
  },
  greeting: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[500],
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    marginBottom: DesignSystem.spacing[1],
  },
  appName: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight Oura style
    color: DesignSystem.colors.neutral[900],
    letterSpacing: 1,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.sm,
  },
  profileIcon: {
    fontSize: 24,
  },
  section: {
    marginBottom: DesignSystem.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing[3],
  },
  featureName: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.regular,  // Lighter
    color: DesignSystem.colors.neutral[500],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.medium,  // Lighter
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
  },
  sectionSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    color: DesignSystem.colors.neutral[500],
    marginBottom: DesignSystem.spacing[4],
  },
  lastTestInfo: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[500],
    marginBottom: DesignSystem.spacing[2],
    paddingHorizontal: DesignSystem.spacing[1],
  },
  quickActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  quickActionButton: {
    flex: 1,
    padding: DesignSystem.spacing[5],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    alignItems: 'center',
    ...DesignSystem.shadows.sm,
  },
  hormoneDot: {
    width: 8,
    height: 8,
    borderRadius: DesignSystem.radius.full,
    position: 'absolute',
    top: DesignSystem.spacing[3],
    right: DesignSystem.spacing[3],
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing[2],
  },
  quickActionText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.regular,  // Lighter
    color: DesignSystem.colors.neutral[700],
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing[3],
  },
  featureCard: {
    width: (width - DesignSystem.spacing[6] * 2 - DesignSystem.spacing[3]) / 2,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    ...DesignSystem.shadows.sm,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[3],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureInfoButton: {
    width: 24,
    height: 24,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfoIcon: {
    fontSize: 12,
  },
  featureCardName: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,  // Lighter
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  featureCardDescription: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.xs * 1.6,
  },
  // Impact Card Styles
  impactCard: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    marginBottom: 24,
    ...DesignSystem.shadows.sm,
    alignItems: 'center',
  },
  impactIcon: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[3],
  },
  impactTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
    textAlign: 'center',
  },
  impactDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[5],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
  impactCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  impactCTAText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[500],
  },
  impactArrow: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.primary[500],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
    alignItems: 'center',
    ...DesignSystem.shadows.sm,
  },
  statValue: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: '200',  // Very thin like Oura
    color: DesignSystem.colors.primary[500],
    marginBottom: DesignSystem.spacing[1],
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    textAlign: 'center',
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
  tipSection: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[100],
  },
  tipIcon: {
    fontSize: 28,
    marginBottom: DesignSystem.spacing[2],
  },
  tipTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  tipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
  fab: {
    position: 'absolute',
    bottom: DesignSystem.spacing[6],
    right: DesignSystem.spacing[6],
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[6],
    ...DesignSystem.shadows.lg,
  },
  fabIcon: {
    fontSize: 20,
    marginRight: DesignSystem.spacing[2],
  },
  fabText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[0],
  },
  // Feature Preview Styles (for empty state)
  featurePreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: DesignSystem.spacing[4],
  },
  featurePreviewCard: {
    width: '48%',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    padding: DesignSystem.spacing[4],
    marginBottom: DesignSystem.spacing[4],
    ...DesignSystem.shadows.sm,
  },
  featurePreviewIcon: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing[2],
  },
  featurePreviewName: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  featurePreviewDesc: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.xs * 1.5,
    marginBottom: DesignSystem.spacing[2],
  },
  featurePreviewUnlock: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[600],
  },
});
