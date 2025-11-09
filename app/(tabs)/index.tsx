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
import { FeatureExplainer, FeatureType } from '@/components/FeatureExplainer';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HORMONES = [
  { type: 'cortisol', name: 'Cortisol', icon: '💧', color: DesignSystem.colors.hormones.cortisol },
  { type: 'testosterone', name: 'Testosterone', icon: '⚡', color: DesignSystem.colors.hormones.testosterone },
  { type: 'dhea', name: 'DHEA', icon: '🔥', color: DesignSystem.colors.hormones.dhea },
] as const;

const FEATURES = [
  {
    id: 'track',
    name: 'Test History',
    description: 'View all your hormone tests',
    icon: '📊',
    color: DesignSystem.colors.info.DEFAULT,
    route: '/track' as const,
  },
  {
    id: 'impact',
    name: 'IMPACT™',
    description: 'See what works for you',
    icon: '🎯',
    color: DesignSystem.colors.success.DEFAULT,
    route: '/impact' as const,
  },
  {
    id: 'protocols',
    name: 'Protocols',
    description: 'Optimization plans',
    icon: '📋',
    color: DesignSystem.colors.warning.DEFAULT,
    route: '/protocols' as const,
  },
  {
    id: 'ask',
    name: 'ASK™',
    description: 'AI Hormone Coach',
    icon: '🤖',
    color: DesignSystem.colors.primary[500],
    route: '/ask' as const,
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male');
  const [userAge, setUserAge] = useState(30);
  const [showExplainer, setShowExplainer] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('test');

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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
      </View>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

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

        {/* READYSCORE™ Card */}
        <RNView style={styles.section}>
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

        {/* Quick TEST™ Actions */}
        <RNView style={styles.section}>
          <RNView style={styles.sectionHeader}>
            <Text style={styles.featureName}>TEST™</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => handleShowExplainer('test')}
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
            </TouchableOpacity>
          </RNView>
          <Text style={styles.sectionSubtitle}>Log your hormone levels</Text>
          <RNView style={styles.quickActions}>
            {HORMONES.map((hormone) => (
              <TouchableOpacity
                key={hormone.type}
                style={[
                  styles.quickActionButton,
                  { borderColor: hormone.color }
                ]}
                onPress={() => handleHormoneSelect(hormone.type)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionIcon}>{hormone.icon}</Text>
                <Text style={styles.quickActionText}>{hormone.name}</Text>
              </TouchableOpacity>
            ))}
          </RNView>
        </RNView>

        {/* BIOAGE™ Card */}
        <RNView style={styles.section}>
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

        {/* Feature Grid */}
        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          <RNView style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => handleFeaturePress(feature.route)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[feature.color, feature.color + '00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureGradient}
                />
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureCardName}>{feature.name}</Text>
                <Text style={styles.featureCardDescription}>{feature.description}</Text>
              </TouchableOpacity>
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

      {/* Floating TEST™ Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/test/input')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={DesignSystem.colors.gradients.primary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>🧪</Text>
          <Text style={styles.fabText}>TEST™</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Feature Explainer Modal */}
      <FeatureExplainer
        visible={showExplainer}
        feature={currentFeature}
        onClose={() => setShowExplainer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
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
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing[1],
  },
  appName: {
    fontSize: DesignSystem.typography.fontSize['4xl'],
    fontWeight: DesignSystem.typography.fontWeight.extrabold,
    color: DesignSystem.colors.neutral[900],
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.DEFAULT,
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
    marginBottom: DesignSystem.spacing[2],
  },
  featureName: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.primary[600],
    letterSpacing: DesignSystem.typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
  },
  sectionSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[4],
  },
  quickActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  quickActionButton: {
    flex: 1,
    padding: DesignSystem.spacing[5],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 2,
    backgroundColor: DesignSystem.colors.neutral[0],
    alignItems: 'center',
    ...DesignSystem.shadows.DEFAULT,
  },
  quickActionIcon: {
    fontSize: 36,
    marginBottom: DesignSystem.spacing[2],
  },
  quickActionText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing[3],
  },
  featureCard: {
    width: (width - DesignSystem.spacing[6] * 2 - DesignSystem.spacing[3]) / 2,
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    ...DesignSystem.shadows.md,
    overflow: 'hidden',
    position: 'relative',
  },
  featureGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    opacity: 0.1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing[2],
  },
  featureCardName: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  featureCardDescription: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.relaxed,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
    alignItems: 'center',
    ...DesignSystem.shadows.sm,
  },
  statValue: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.extrabold,
    color: DesignSystem.colors.primary[500],
    marginBottom: DesignSystem.spacing[1],
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  tipSection: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.primary[500],
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing[2],
  },
  tipTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  tipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.relaxed,
  },
  fab: {
    position: 'absolute',
    bottom: DesignSystem.spacing[6],
    right: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.full,
    ...DesignSystem.shadows['2xl'],
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.full,
  },
  fabIcon: {
    fontSize: 24,
    marginRight: DesignSystem.spacing[2],
  },
  fabText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[0],
    letterSpacing: DesignSystem.typography.letterSpacing.wide,
  },
});
