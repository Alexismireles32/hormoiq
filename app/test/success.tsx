import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { HormoneTest, UserProfile } from '@/types';
import { calculateTestInsights, getTimeOfDayContext, detectPersonalRecord } from '@/lib/calculations';
import { Loading } from '@/components/Loading';

const HORMONE_INFO = {
  cortisol: {
    name: 'Cortisol',
    icon: '💧',
    color: '#3B82F6',
  },
  testosterone: {
    name: 'Testosterone',
    icon: '⚡',
    color: '#EF4444',
  },
  dhea: {
    name: 'DHEA',
    icon: '🔥',
    color: '#F97316',
  },
} as const;

export default function SuccessScreen() {
  const { testId, hormone, value } = useLocalSearchParams<{
    testId: string;
    hormone: 'cortisol' | 'testosterone' | 'dhea';
    value: string;
  }>();
  const { user } = useAuth();

  const [test, setTest] = useState<HormoneTest | null>(null);
  const [previousTests, setPreviousTests] = useState<HormoneTest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkmarkScale = new Animated.Value(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Animate checkmark
    Animated.spring(checkmarkScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Auto-navigate after 5 seconds
    const timeout = setTimeout(() => {
      router.replace('/(tabs)/track');
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const loadData = async () => {
    if (!user || !testId) return;

    try {
      // Fetch the test
      const { data: testData } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testData) {
        setTest(testData as HormoneTest);
      }

      // Fetch previous tests of same type
      const { data: previousData } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('user_id', user.id)
        .eq('hormone_type', hormone)
        .neq('id', testId)
        .order('timestamp', { ascending: false });

      if (previousData) {
        setPreviousTests(previousData as HormoneTest[]);
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData as UserProfile);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !test) {
    return <Loading message="Analyzing your test..." fullScreen />;
  }

  const info = HORMONE_INFO[hormone];
  const insights = calculateTestInsights(test, previousTests, userProfile?.gender || 'male');
  const timeOfDay = getTimeOfDayContext(test.timestamp);
  const personalRecord = detectPersonalRecord(test.value, previousTests);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Checkmark */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: checkmarkScale }],
            },
          ]}
        >
          <View style={[styles.checkmarkCircle, { backgroundColor: info.color }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Test Saved!</Text>
        <Text style={styles.successSubtitle}>{info.icon} {info.name}</Text>

        {/* Main Insight */}
        <View
          style={[
            styles.insightCard,
            {
              backgroundColor:
                insights.status === 'optimal'
                  ? '#10B981'
                  : insights.status === 'borderline'
                  ? '#F59E0B'
                  : '#EF4444',
            },
          ]}
        >
          <Text style={styles.insightTitle}>
            {insights.status === 'optimal' ? '✓ ' : ''}
            {insights.statusMessage}
          </Text>
          {timeOfDay && (
            <Text style={styles.insightSubtext}>
              Tested in the {timeOfDay}
            </Text>
          )}
        </View>

        {/* Additional Insights */}
        <View style={styles.insightsContainer}>
          {/* Test Count */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>📊</Text>
            <Text style={styles.infoText}>{insights.testCountMessage}</Text>
          </View>

          {/* Comparison to Average */}
          {insights.comparisonToAverage && (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>📈</Text>
              <Text style={styles.infoText}>{insights.comparisonToAverage}</Text>
            </View>
          )}

          {/* Personal Record */}
          {personalRecord.isRecord && (
            <View style={[styles.infoBox, styles.recordBox]}>
              <Text style={styles.infoIcon}>🏆</Text>
              <Text style={styles.infoText}>
                Personal {personalRecord.type === 'highest' ? 'high' : 'low'} record!
              </Text>
            </View>
          )}

          {/* Anomaly Warning */}
          {insights.anomalyDetected && insights.anomalyMessage && (
            <View style={[styles.infoBox, styles.warningBox]}>
              <Text style={styles.infoIcon}>⚠️</Text>
              <Text style={styles.infoText}>{insights.anomalyMessage}</Text>
            </View>
          )}
        </View>

        {/* Context Summary */}
        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>Context</Text>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Sleep:</Text>
            <Text style={styles.contextValue}>
              {'⭐'.repeat(test.sleep_quality || 0)}
            </Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Exercise:</Text>
            <Text style={styles.contextValue}>
              {test.exercised ? 'Yes ✓' : 'No'}
            </Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Stress:</Text>
            <Text style={styles.contextValue}>
              {['😌', '😊', '😐', '😰', '😫'][test.stress_level ? test.stress_level - 1 : 2]}
            </Text>
          </View>
          {test.supplements && (
            <View style={styles.contextRow}>
              <Text style={styles.contextLabel}>Supplements:</Text>
              <Text style={styles.contextValue}>{test.supplements}</Text>
            </View>
          )}
        </View>

        {/* Auto-navigate message */}
        <Text style={styles.autoNavigateText}>
          Redirecting to Track in a few seconds...
        </Text>
      </ScrollView>

      {/* Manual Navigation Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: info.color }]}
          onPress={() => router.replace('/(tabs)/track')}
        >
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  successSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  insightCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 26,
    marginBottom: 8,
  },
  insightSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  insightsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  recordBox: {
    backgroundColor: '#FEF3C7',
  },
  warningBox: {
    backgroundColor: '#FEE2E2',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  contextCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  contextLabel: {
    fontSize: 14,
    color: '#666',
  },
  contextValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  autoNavigateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

