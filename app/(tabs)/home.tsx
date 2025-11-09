import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { HormoneTest, UserProfile } from '@/types';
import { calculateReadyScore, getScoreColor, getScoreLabel } from '@/lib/readyscore';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      // Fetch all tests
      const { data: testsData } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (testsData) {
        setTests(testsData as HormoneTest[]);
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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loading message="Calculating your ReadyScore..." fullScreen />;
  }

  if (tests.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="No ReadyScore Yet"
        description="Log your first hormone test to see your daily readiness score"
        actionLabel="Log Test"
        onAction={() => router.push('/(tabs)')}
      />
    );
  }

  // Get recent tests (last 48 hours)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentTests = tests.filter(t => new Date(t.timestamp) >= twoDaysAgo);

  // Calculate ReadyScore
  const readyScoreData = calculateReadyScore(
    recentTests,
    tests,
    userProfile?.gender || 'male'
  );

  const scoreColor = getScoreColor(readyScoreData.score);
  const scoreLabel = getScoreLabel(readyScoreData.score);

  const handleTakeTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)');
  };

  const handleAskWhy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Score Breakdown',
      `Cortisol: ${readyScoreData.contributing_factors.cortisol_score > 0 ? '+' : ''}${readyScoreData.contributing_factors.cortisol_score}\n` +
      `Testosterone: ${readyScoreData.contributing_factors.testosterone_score > 0 ? '+' : ''}${readyScoreData.contributing_factors.testosterone_score}\n` +
      `DHEA: ${readyScoreData.contributing_factors.dhea_score > 0 ? '+' : ''}${readyScoreData.contributing_factors.dhea_score}\n` +
      `Context: ${readyScoreData.contributing_factors.context_bonus > 0 ? '+' : ''}${readyScoreData.contributing_factors.context_bonus}\n` +
      `Trend: ${readyScoreData.contributing_factors.trend_bonus > 0 ? '+' : ''}${readyScoreData.contributing_factors.trend_bonus}`,
      [{ text: 'OK' }]
    );
  };

  const getTimeSinceTest = () => {
    if (!readyScoreData.lastTestTimestamp) return 'No recent tests';

    const hours = Math.floor((Date.now() - new Date(readyScoreData.lastTestTimestamp).getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Updated just now';
    if (hours === 1) return 'Updated 1 hour ago';
    if (hours < 24) return `Updated ${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Your ReadyScore</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Circular Progress Score */}
      <View style={styles.scoreContainer}>
        <AnimatedCircularProgress
          size={240}
          width={20}
          fill={readyScoreData.score}
          tintColor={scoreColor}
          backgroundColor="#E5E7EB"
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.scoreContent}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {readyScoreData.score}
              </Text>
              <Text style={styles.scoreLabel}>{scoreLabel}</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      {/* Status Info */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{getTimeSinceTest()}</Text>
        <View style={[styles.confidenceBadge, {
          backgroundColor: readyScoreData.confidence === 'high' ? '#10B981' : 
                          readyScoreData.confidence === 'medium' ? '#F59E0B' : '#EF4444'
        }]}>
          <Text style={styles.confidenceText}>
            {readyScoreData.confidence === 'high' ? 'High Confidence ✅' :
             readyScoreData.confidence === 'medium' ? 'Medium Confidence 🟡' :
             'Low Confidence ⚠️'}
          </Text>
        </View>
      </View>

      {/* Protocol Recommendations */}
      <View style={styles.protocolSection}>
        <Text style={styles.protocolTitle}>Today's Protocol</Text>
        {readyScoreData.protocol.map((recommendation, index) => (
          <View key={index} style={styles.protocolItem}>
            <Text style={styles.protocolBullet}>•</Text>
            <Text style={styles.protocolText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleTakeTest}
        >
          <Text style={styles.primaryButtonText}>Take Test Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleAskWhy}
        >
          <Text style={styles.secondaryButtonText}>See Breakdown</Text>
        </TouchableOpacity>
      </View>

      {/* Contributing Factors (Visual) */}
      <View style={styles.factorsSection}>
        <Text style={styles.factorsTitle}>Score Breakdown</Text>
        <View style={styles.factorsList}>
          {[
            { label: 'Cortisol', value: readyScoreData.contributing_factors.cortisol_score, icon: '💧' },
            { label: 'Testosterone', value: readyScoreData.contributing_factors.testosterone_score, icon: '⚡' },
            { label: 'DHEA', value: readyScoreData.contributing_factors.dhea_score, icon: '🔥' },
            { label: 'Context', value: readyScoreData.contributing_factors.context_bonus, icon: '📊' },
            { label: 'Trend', value: readyScoreData.contributing_factors.trend_bonus, icon: '📈' },
          ].map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <View style={styles.factorLabel}>
                <Text style={styles.factorIcon}>{factor.icon}</Text>
                <Text style={styles.factorName}>{factor.label}</Text>
              </View>
              <Text style={[
                styles.factorValue,
                { color: factor.value > 0 ? '#10B981' : factor.value < 0 ? '#EF4444' : '#666' }
              ]}>
                {factor.value > 0 ? '+' : ''}{factor.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  protocolSection: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  protocolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  protocolItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  protocolBullet: {
    fontSize: 20,
    marginRight: 12,
    color: '#000',
  },
  protocolText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#000',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  factorsSection: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  factorsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  factorsList: {
    gap: 12,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  factorLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorIcon: {
    fontSize: 20,
  },
  factorName: {
    fontSize: 15,
    color: '#666',
  },
  factorValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

