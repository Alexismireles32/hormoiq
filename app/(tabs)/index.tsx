import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { EliAnimatedBackground } from '@/components/EliAnimatedBackground';
import { EliCircularProgress } from '@/components/EliCircularProgress';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import { calculateReadyScore } from '@/lib/ready';
import { calculateBioAge } from '@/lib/bioage';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

/**
 * Main Dashboard - Eli Health Style
 * Soft gradients, circular progress, minimalist design
 */

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
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load tests
      const { data: testsData, error: testsError } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (testsError) throw testsError;
      setTests(testsData || []);

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('biological_sex, age')
        .eq('id', user.id)
        .single();

      if (userData) {
        setUserGender(userData.biological_sex || 'male');
        setUserAge(userData.age || 30);
      }

      // Extract user name from metadata (use test_code as name for now)
      if (user.user_metadata?.test_code) {
        setUserName(user.user_metadata.test_code);
      } else {
        setUserName('User');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/test');
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/profile');
  };

  // Calculate hormone values for display
  const getLatestHormoneValue = (hormoneType: 'cortisol' | 'testosterone' | 'progesterone') => {
    const hormoneTests = tests.filter(t => t.hormone_type === hormoneType);
    if (hormoneTests.length === 0) return null;
    
    // Get most recent
    return hormoneTests[0].value;
  };

  const getHormoneStatus = (value: number | null, hormoneType: string) => {
    if (!value) return 'No data';
    
    // Simple status based on value ranges
    if (hormoneType === 'cortisol') {
      if (value >= 5 && value <= 20) return 'Optimal';
      if (value < 5) return 'Low';
      return 'High';
    } else if (hormoneType === 'testosterone') {
      if (userGender === 'male') {
        if (value >= 300 && value <= 900) return 'Optimal';
        if (value < 300) return 'Low';
        return 'High';
      } else {
        if (value >= 15 && value <= 70) return 'Optimal';
        if (value < 15) return 'Low';
        return 'High';
      }
    } else if (hormoneType === 'progesterone') {
      if (userGender === 'male') {
        if (value >= 0.2 && value <= 1.5) return 'Optimal';
        if (value < 0.2) return 'Low';
        return 'High';
      } else {
        if (value >= 5 && value <= 25) return 'Optimal';
        if (value < 5) return 'Low';
        return 'High';
      }
    }
    return 'Unknown';
  };

  const getLastTestTime = (hormoneType: string) => {
    const hormoneTests = tests.filter(t => t.hormone_type === hormoneType);
    if (hormoneTests.length === 0) return null;
    
    const date = new Date(hormoneTests[0].timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Calculate ReadyScore
  const readyData = tests.length > 0 ? calculateReadyScore(tests, userGender) : null;

  if (loading) {
    return (
      <EliAnimatedBackground type="multi" scrollEnabled={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </EliAnimatedBackground>
    );
  }

  return (
    <EliAnimatedBackground type="multi">
      <View style={styles.content}>
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress}>
            <View style={styles.profilePhoto}>
              <Text style={styles.profilePhotoText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hormone Cards */}
        <View style={styles.cardSection}>
          {/* Cortisol Card */}
          <View style={[styles.hormoneCard, { backgroundColor: DesignSystem.colors.hormones.cortisol }]}>
            <TouchableOpacity 
              style={styles.cardInner}
              onPress={() => router.push('/test/input?hormone=cortisol')}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.hormoneLabel}>Cortisol</Text>
                <Text style={styles.cardArrow}>→</Text>
              </View>
              
              {getLatestHormoneValue('cortisol') ? (
                <>
                  <EliCircularProgress
                    value={Math.min(100, (getLatestHormoneValue('cortisol')! / 30) * 100)}
                    size={140}
                    strokeWidth={2}
                  />
                  <Text style={styles.hormoneStatus}>
                    {getHormoneStatus(getLatestHormoneValue('cortisol'), 'cortisol')}
                  </Text>
                  <Text style={styles.hormoneTime}>
                    {getLastTestTime('cortisol')}
                  </Text>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No data yet</Text>
                  <Text style={styles.noDataSubtext}>Tap to log first test</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Progesterone Card */}
          <View style={[styles.hormoneCard, { backgroundColor: DesignSystem.colors.hormones.progesterone }]}>
            <TouchableOpacity 
              style={styles.cardInner}
              onPress={() => router.push('/test/input?hormone=progesterone')}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.hormoneLabel}>Progesterone</Text>
                <Text style={styles.cardArrow}>→</Text>
              </View>
              
              {getLatestHormoneValue('progesterone') ? (
                <>
                  <EliCircularProgress
                    value={Math.min(100, (getLatestHormoneValue('progesterone')! / (userGender === 'male' ? 5 : 40)) * 100)}
                    size={140}
                    strokeWidth={2}
                  />
                  <Text style={styles.hormoneStatus}>
                    {getHormoneStatus(getLatestHormoneValue('progesterone'), 'progesterone')}
                  </Text>
                  <Text style={styles.hormoneTime}>
                    {getLastTestTime('progesterone')}
                  </Text>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No data yet</Text>
                  <Text style={styles.noDataSubtext}>Tap to log first test</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Testosterone Card */}
          <View style={[styles.hormoneCard, { backgroundColor: DesignSystem.colors.hormones.testosterone }]}>
            <TouchableOpacity 
              style={styles.cardInner}
              onPress={() => router.push('/test/input?hormone=testosterone')}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.hormoneLabel}>Testosterone</Text>
                <Text style={styles.cardArrow}>→</Text>
              </View>
              
              {getLatestHormoneValue('testosterone') ? (
                <>
                  <EliCircularProgress
                    value={Math.min(100, (getLatestHormoneValue('testosterone')! / (userGender === 'male' ? 1200 : 100)) * 100)}
                    size={140}
                    strokeWidth={2}
                  />
                  <Text style={styles.hormoneStatus}>
                    {getHormoneStatus(getLatestHormoneValue('testosterone'), 'testosterone')}
                  </Text>
                  <Text style={styles.hormoneTime}>
                    {getLastTestTime('testosterone')}
                  </Text>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No data yet</Text>
                  <Text style={styles.noDataSubtext}>Tap to log first test</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Marketing CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>
            Understand your{'\n'}hormonal health
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleLogTest}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Log a test</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </View>

      {/* Bottom Navigation with large center button */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerButton} onPress={handleLogTest}>
          <Text style={styles.centerButtonIcon}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/insights')}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Insights</Text>
        </TouchableOpacity>
      </View>
    </EliAnimatedBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontStyle: 'italic',
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontStyle: 'italic',
    color: DesignSystem.colors.text.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  profilePhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignSystem.colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    color: DesignSystem.colors.surface,
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  cardSection: {
    gap: 20,
  },
  hormoneCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 280,
  },
  cardInner: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hormoneLabel: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.primary,
  },
  cardArrow: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    color: DesignSystem.colors.text.primary,
  },
  hormoneStatus: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  hormoneTime: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.tertiary,
  },
  ctaSection: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 32,
  },
  ctaText: {
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontStyle: 'italic',
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize['3xl'] * 1.3,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: DesignSystem.colors.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.surface,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: DesignSystem.colors.surface,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.secondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DesignSystem.colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  centerButtonIcon: {
    fontSize: 32,
    color: DesignSystem.colors.surface,
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
});
