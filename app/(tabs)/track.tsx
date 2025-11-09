import { BioAgeCard } from '@/components/BioAgeCard';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { MiniChart } from '@/components/MiniChart';
import { DataSummary, SummaryItem } from '@/components/DataSummary';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedTouchable } from '@/components/AnimatedTouchable';
import { EliAnimatedBackground } from '@/components/EliAnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DesignSystem } from '@/constants/DesignSystem';

const HORMONE_COLORS = {
  cortisol: DesignSystem.colors.hormones.cortisol,      // Soft blue-gray
  testosterone: DesignSystem.colors.hormones.testosterone,  // Soft rose
  dhea: DesignSystem.colors.hormones.dhea,              // Soft amber
};

const HORMONE_ICONS = {
  cortisol: '💧',
  testosterone: '⚡',
  dhea: '🔥',
};

export default function TrackScreen() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState<'cortisol' | 'testosterone' | 'dhea' | 'all'>('all');
  const [userAge, setUserAge] = useState(30); // Default age
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male'); // Default gender

  useEffect(() => {
    loadTests();
    loadUserProfile();
  }, []);

  const loadTests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setTests((data as HormoneTest[]) || []);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('age, gender')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserAge(data.age || 30);
        setUserGender(data.gender || 'male');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTests();
  }, []);

  const handleTestPress = (test: HormoneTest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Show detail modal
    Alert.alert(
      'Test Details',
      `${test.hormone_type}: ${test.value}\nSleep: ${'⭐'.repeat(test.sleep_quality || 0)}\nExercise: ${test.exercised ? 'Yes' : 'No'}\nStress: ${['😌', '😊', '😐', '😰', '😫'][test.stress_level ? test.stress_level - 1 : 2]}${test.supplements ? `\nSupplements: ${test.supplements}` : ''}`,
      [{ text: 'Close' }]
    );
  };

  const calculateStats = () => {
    if (tests.length === 0) return { total: 0, thisWeek: 0, streak: 0 };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = tests.filter(t => new Date(t.timestamp) >= oneWeekAgo).length;

    // Calculate streak (consecutive days with tests)
    const sortedTests = [...tests].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const test of sortedTests) {
      const testDate = new Date(test.timestamp);
      testDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - testDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysDiff <= 1) {
        if (testDate.getTime() === currentDate.getTime() || 
            daysDiff === 1) {
          streak++;
          currentDate = testDate;
        }
      } else {
        break;
      }
    }

    return { total: tests.length, thisWeek, streak };
  };

  const getFilteredTests = () => {
    if (selectedHormone === 'all') return tests;
    return tests.filter(t => t.hormone_type === selectedHormone);
  };

  const getChartData = (hormoneType: 'cortisol' | 'testosterone' | 'dhea') => {
    const hormoneTests = tests
      .filter(t => t.hormone_type === hormoneType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-10); // Last 10 tests

    if (hormoneTests.length === 0) return null;

    return {
      labels: hormoneTests.map((_, i) => `${i + 1}`),
      datasets: [{
        data: hormoneTests.map(t => t.value),
        color: () => HORMONE_COLORS[hormoneType],
        strokeWidth: 3,
      }],
    };
  };

  if (loading) {
    return <Loading message="Loading your history..." fullScreen />;
  }

  if (tests.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No Tests Yet"
        description="Log your first hormone test to start tracking your health journey"
        actionLabel="Log Test"
        onAction={() => router.push('/(tabs)')}
      />
    );
  }

  const stats = calculateStats();
  const filteredTests = getFilteredTests();
  const screenWidth = Dimensions.get('window').width;

  return (
    <EliAnimatedBackground type="green">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test History</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
      {/* BioAge */}
      <BioAgeCard 
        tests={tests}
        chronologicalAge={userAge}
        userGender={userGender}
      />

      {/* Summary Stats with DataSummary Component */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <DataSummary
          items={[
            {
              label: 'Total Tests',
              value: stats.total,
              icon: '📊',
              subtitle: 'All time',
            },
            {
              label: 'This Week',
              value: stats.thisWeek,
              icon: '📅',
              trend: stats.thisWeek >= 3 ? 'up' : stats.thisWeek > 0 ? 'neutral' : 'down',
            },
            {
              label: 'Streak',
              value: `${stats.streak}`,
              icon: '🔥',
              subtitle: stats.streak > 0 ? 'days' : 'Start today!',
              color: stats.streak >= 7 ? DesignSystem.colors.success.DEFAULT : undefined,
            },
          ]}
          columns={3}
        />
      </View>

      {/* Hormone Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterButton, selectedHormone === 'all' && styles.filterButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedHormone('all');
          }}
        >
          <Text style={[styles.filterText, selectedHormone === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {(['cortisol', 'testosterone', 'dhea'] as const).map((hormone) => (
          <TouchableOpacity
            key={hormone}
            style={[
              styles.filterButton,
              selectedHormone === hormone && styles.filterButtonActive,
              selectedHormone === hormone && { backgroundColor: HORMONE_COLORS[hormone] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedHormone(hormone);
            }}
          >
            <Text style={[styles.filterText, selectedHormone === hormone && styles.filterTextActive]}>
              {HORMONE_ICONS[hormone]} {hormone.charAt(0).toUpperCase() + hormone.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Trends</Text>
        {selectedHormone === 'all' ? (
          <>
            {(['cortisol', 'testosterone', 'dhea'] as const).map((hormone) => {
              const chartData = getChartData(hormone);
              if (!chartData) return null;

              return (
                <View key={hormone} style={styles.chartCard}>
                  <Text style={styles.chartTitle}>
                    {HORMONE_ICONS[hormone]} {hormone.charAt(0).toUpperCase() + hormone.slice(1)}
                  </Text>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 68}
                    height={180}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 1,
                      color: () => HORMONE_COLORS[hormone],
                      labelColor: () => '#666',
                      style: { borderRadius: 16 },
                      propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: HORMONE_COLORS[hormone],
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </View>
              );
            })}
          </>
        ) : (
          <>
            {(() => {
              const chartData = getChartData(selectedHormone);
              if (!chartData) {
                return (
                  <Text style={styles.noDataText}>
                    No {selectedHormone} tests yet
                  </Text>
                );
              }

              return (
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>
                    {HORMONE_ICONS[selectedHormone]} {selectedHormone.charAt(0).toUpperCase() + selectedHormone.slice(1)}
                  </Text>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 68}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 1,
                      color: () => HORMONE_COLORS[selectedHormone],
                      labelColor: () => '#666',
                      style: { borderRadius: 16 },
                      propsForDots: {
                        r: '6',
                        strokeWidth: '3',
                        stroke: HORMONE_COLORS[selectedHormone],
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </View>
              );
            })()}
          </>
        )}
      </View>

      {/* Timeline Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <Text style={styles.sectionSubtitle}>
          Your testing journey at a glance
        </Text>
        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>First Test</Text>
              <Text style={styles.timelineDate}>
                {tests.length > 0
                  ? new Date(tests[tests.length - 1].timestamp).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Latest Test</Text>
              <Text style={styles.timelineDate}>
                {tests.length > 0
                  ? new Date(tests[0].timestamp).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Next Goal</Text>
              <Text style={styles.timelineValue}>
                {stats.thisWeek >= 3 ? 'Keep it up! 🎯' : `${3 - stats.thisWeek} more this week`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Test List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent Tests</Text>
        {filteredTests.map((test, index) => (
          <AnimatedCard key={test.id} index={index} style={{ marginBottom: DesignSystem.spacing[3] }}>
            <AnimatedTouchable
              style={styles.testCard}
              onPress={() => handleTestPress(test)}
              scaleValue={0.98}
            >
            <View style={[styles.testIconContainer, { backgroundColor: HORMONE_COLORS[test.hormone_type] }]}>
              <Text style={styles.testIcon}>{HORMONE_ICONS[test.hormone_type]}</Text>
            </View>
            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>
                {test.hormone_type.charAt(0).toUpperCase() + test.hormone_type.slice(1)}
              </Text>
              <Text style={styles.testDate}>
                {new Date(test.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.testValueContainer}>
              <Text style={styles.testValue}>{test.value}</Text>
              <Text style={styles.testUnit}>
                {test.hormone_type === 'cortisol' ? 'ng/mL' : 'ng/dL'}
              </Text>
            </View>
            </AnimatedTouchable>
          </AnimatedCard>
        ))}
      </View>

      <View style={{ height: 40 }} />
      </View>
    </EliAnimatedBackground>
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
    backgroundColor: DesignSystem.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.oura.cardBorder,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: DesignSystem.colors.neutral[900],
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,  // Light weight
    color: DesignSystem.colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    alignItems: 'center',
    ...DesignSystem.shadows.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '200',  // Thin like Oura
    color: DesignSystem.colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[500],
  },
  section: {
    marginBottom: DesignSystem.spacing[6],
  },
  sectionSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[4],
  },
  filterContainer: {
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
  },
  filterButtonActive: {
    borderColor: DesignSystem.colors.primary[500],
    backgroundColor: DesignSystem.colors.primary[500],
  },
  filterText: {
    fontSize: 14,
    fontWeight: DesignSystem.typography.fontWeight.regular,
    color: DesignSystem.colors.neutral[600],
  },
  filterTextActive: {
    color: '#fff',
  },
  chartsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  chart: {
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    padding: 40,
  },
  listSection: {
    marginBottom: 24,
  },
  timelineCard: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignSystem.colors.neutral[300],
    marginRight: DesignSystem.spacing[4],
  },
  timelineDotActive: {
    backgroundColor: DesignSystem.colors.primary[500],
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: DesignSystem.colors.neutral[200],
    marginLeft: 5,
    marginVertical: DesignSystem.spacing[2],
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[600],
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  timelineValue: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[600],
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.xl,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  testIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  testIcon: {
    fontSize: 24,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 14,
    color: '#666',
  },
  testValueContainer: {
    alignItems: 'flex-end',
  },
  testValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  testUnit: {
    fontSize: 12,
    color: '#666',
  },
});
