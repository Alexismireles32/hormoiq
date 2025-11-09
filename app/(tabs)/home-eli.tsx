import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { EliBackground } from '@/components/EliBackground';
import { EliCircularProgress } from '@/components/EliCircularProgress';
import { supabase } from '@/lib/supabase';
import { HormoneTest } from '@/types';
import { calculateReadyScore } from '@/lib/ready';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

/**
 * Eli Health-inspired Dashboard
 * Features:
 * - Soft gradient background
 * - Large greeting with profile photo
 * - Hormone cards with circular progress
 * - Minimal, clean design
 * - Serif italic headings
 */
export default function HomeDashboardEli() {
  const { user } = useAuth();
  const [tests, setTests] = useState<HormoneTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male');
  const [userName, setUserName] = useState<string>('');

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
        .select('gender')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setUserGender(profileData.gender || 'male');
      }

      // Get user name from metadata
      if (user.user_metadata?.test_code) {
        setUserName(user.user_metadata.test_code);
      } else {
        setUserName('User');
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getLatestHormoneValue = (hormoneType: string) => {
    const hormoneTests = tests.filter((t) => t.hormone_type === hormoneType);
    if (hormoneTests.length === 0) return null;
    return hormoneTests[0].value;
  };

  const getHormoneScore = (hormoneType: string) => {
    const value = getLatestHormoneValue(hormoneType);
    if (!value) return 0;
    
    // Simple scoring (can be enhanced with actual algorithm)
    // For now, map values to 0-100 range
    if (hormoneType === 'cortisol') {
      // Optimal cortisol: 0.5-1.5 ng/mL
      if (value >= 0.5 && value <= 1.5) return 90;
      if (value < 0.5) return Math.max(0, 60 - ((0.5 - value) * 40));
      return Math.max(0, 90 - ((value - 1.5) * 20));
    }
    
    return 85; // Default placeholder
  };

  const getHormoneLabel = (hormoneType: string) => {
    const value = getLatestHormoneValue(hormoneType);
    if (!value) return 'No data';
    
    const score = getHormoneScore(hormoneType);
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Within range';
    return 'Below range';
  };

  const getHormoneTime = (hormoneType: string) => {
    const hormoneTests = tests.filter((t) => t.hormone_type === hormoneType);
    if (hormoneTests.length === 0) return '';
    
    const date = new Date(hormoneTests[0].timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <EliBackground type="multi">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </EliBackground>
    );
  }

  return (
    <EliBackground type="multi">
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profilePhoto}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profile');
            }}
          >
            <View style={styles.profilePhotoPlaceholder}>
              <Text style={styles.profilePhotoText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hormone Cards */}
        <View style={styles.hormonesContainer}>
          {/* Cortisol Card */}
          <TouchableOpacity
            style={[styles.hormoneCard, { backgroundColor: '#DBEAFE' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/track');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.hormoneCardHeader}>
              <Text style={styles.hormoneCardTitle}>Cortisol</Text>
              <TouchableOpacity>
                <Text style={styles.hormoneCardArrow}>→</Text>
              </TouchableOpacity>
            </View>
            
            <EliCircularProgress
              value={getHormoneScore('cortisol')}
              label={getHormoneLabel('cortisol')}
              sublabel={getHormoneTime('cortisol')}
              size={160}
            />
          </TouchableOpacity>

          {/* Progesterone Card */}
          <TouchableOpacity
            style={[styles.hormoneCard, { backgroundColor: '#DCFCE7' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/track');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.hormoneCardHeader}>
              <Text style={styles.hormoneCardTitle}>Progesterone</Text>
              <TouchableOpacity>
                <Text style={styles.hormoneCardArrow}>→</Text>
              </TouchableOpacity>
            </View>
            
            <EliCircularProgress
              value={getHormoneScore('progesterone')}
              label={getHormoneLabel('progesterone')}
              sublabel={getHormoneTime('progesterone')}
              size={160}
            />
          </TouchableOpacity>
        </View>

        {/* Marketing-style CTA */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Understand your{'\n'}hormonal health</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/test');
            }}
          >
            <Text style={styles.ctaButtonText}>Log a test</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation with large center button */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push('/test');
          }}
        >
          <Text style={styles.centerButtonIcon}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/protocols')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Plans</Text>
        </TouchableOpacity>
      </View>
    </EliBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    marginBottom: DesignSystem.spacing[8],
  },
  greeting: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontStyle: 'italic',
    color: '#000000',
  },
  userName: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.regular,
    color: '#000000',
    marginTop: DesignSystem.spacing[1],
  },
  profilePhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profilePhotoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  hormonesContainer: {
    paddingHorizontal: DesignSystem.spacing[6],
    gap: DesignSystem.spacing[4],
  },
  hormoneCard: {
    borderRadius: 16,
    padding: DesignSystem.spacing[6],
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  hormoneCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: DesignSystem.spacing[6],
  },
  hormoneCardTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: '#000000',
  },
  hormoneCardArrow: {
    fontSize: 24,
    color: '#000000',
  },
  ctaContainer: {
    paddingHorizontal: DesignSystem.spacing[6],
    paddingVertical: DesignSystem.spacing[8],
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.light,
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontStyle: 'italic',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: DesignSystem.spacing[6],
  },
  ctaButton: {
    backgroundColor: '#000000',
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[10],
    borderRadius: DesignSystem.radius.full,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: '#FFFFFF',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: DesignSystem.spacing[8],
    paddingTop: DesignSystem.spacing[4],
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing[2],
  },
  navIcon: {
    fontSize: 24,
    marginBottom: DesignSystem.spacing[1],
  },
  navLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: '#000000',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32, // Half the button height to overlap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  centerButtonIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

